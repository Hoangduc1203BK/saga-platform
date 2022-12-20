import { ProducerService } from "./../../kafka/producer/producer";
import { Service, Container } from "typedi";
import { OrchestratorDto } from "../dto/orchestrator.dto";
import { Transaction } from "../model/orchestrator.model";
import { MessageFromKafka, MESSAGE_TYPE } from "../types/message";
import { v4 as uuidv4} from 'uuid';
import { RedisService } from "../redis/redis";
import { handleMessage } from '../../kafka/handleMessage';
import { ORCHESTRATOR_TOPIC, TOPIC } from "../types/topic";
@Service()
export class Orchestrator {
  private producer: any;
  private redisService: RedisService;
  constructor() {
    this.producer = new ProducerService();
    const orchestratorTopic = [
      { topic: TOPIC, partitions: 1, replicationFactor: 1 },
    ];
    this.producer.createTopic(orchestratorTopic);

    this.redisService = Container.get(RedisService)
  }

  async createTransaction(payload: OrchestratorDto) {
    const { services, data } = payload;
    const createTransaction = {
      _id:  uuidv4(),
      ...payload,
      status: "PENDING",
    };

    await this.redisService.setService(TOPIC, createTransaction);

    const doc = {
      id: createTransaction._id,
      ...data,
      step: 0,
    };
    const topics = services.map((el) => {
      return {
        topic: el,
        partitions: 1,
        replicationFactor: 1,
      };
    });

    await this.producer.createTopic(topics);

    await this.produceEvent(services[0], doc);

    return true;
  }


  async getTransaction(id: string) {
    const transaction = await this.redisService.getService(id);

    if(!transaction._id) {
      throw new Error('Transaction not found')
    }

    return transaction;
  }

  async produceEvent(topic: string, payload: any) {
    await this.producer.produce(topic, JSON.stringify(payload));
  }

  async consumeEvent(payload: MessageFromKafka) {
    const transactionId = payload.transactionId;
    const transaction = await this.getTransaction(transactionId);
    const indexService = transaction.services.indexOf(payload.service);
    let doc = {
      ...payload.data,
      transactionId,
    };

    switch (payload.type) {
      case MESSAGE_TYPE.SUCCESS:
        if (indexService < transaction.successFlow.length) {
          const nextService = transaction.services[indexService + 1];
          transaction.status = payload.message;

          //set redis
          await this.redisService.setService(TOPIC, transaction);

          if (indexService < transaction.successFlow.length - 1) {
            doc.step = payload.step + 1;
            await this.produceEvent(nextService, doc);
          }

          if(indexService === transaction.services.length - 1) {
            const cacheData = await this.redisService.getService(doc.transactionId);
            const transaction = new Transaction(cacheData);
            await transaction.save();

            const payload = {
              topic: ORCHESTRATOR_TOPIC.SUCCESS_TRANSACTION,
              payload: {
                ...doc
              }
            }

            await handleMessage(payload, transaction.services);
          }
        }
        break;
      case MESSAGE_TYPE.FAIL:
        if (indexService !== 0) {
          transaction.status = transaction.failFlow[payload.step];

          //set redis
          await this.redisService.setService(TOPIC, transaction);

          const message = {
            topic: ORCHESTRATOR_TOPIC.FAIL_TRANSACTION,
            payload: {
              ...doc
            }
          }

          await handleMessage(message, transaction.services);
        }
        break;
      case MESSAGE_TYPE.REFRESH:
        const { services, successFlow, failFlow, data } = transaction;
        const createTransactionDto = {
          services,
          successFlow,
          failFlow,
          data
        }
        const messageToKafka = {
          topic: ORCHESTRATOR_TOPIC.FAIL_TRANSACTION,
          payload: {
            ...doc
          }
        }

        await handleMessage(messageToKafka, services);
        await this.createTransaction(createTransactionDto);

        break;
      default:
        break;
    }
  }
}
