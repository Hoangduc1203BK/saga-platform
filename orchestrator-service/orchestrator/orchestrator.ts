import { ProducerService } from "./../../kafka/producer/producer";
import { Service, Container } from "typedi";
import { OrchestratorDto } from "../dto/orchestrator.dto";
import { Transaction } from "../model/orchestrator.model";
import { MessageFromKafka } from "../types/message";

@Service()
export class Orchestrator {
  private producer: any;
  constructor() {
    this.producer = new ProducerService();
    const orchestratorTopic = [
      { topic: "ORCHESTRATOR-SERVICE-2", partitions: 1, replicationFactor: 1 },
    ];
    this.producer.createTopic(orchestratorTopic);
  }

  async createTransaction(payload: OrchestratorDto) {
    const { services, data } = payload;
    const createTransaction = {
      ...payload,
      status: "PENDING",
    };
    const transaction = new Transaction(createTransaction);

    const result = await transaction.save();
    const doc = {
      id: result._id,
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

    return result;
  }

  async produceEvent(topic: string, payload: any) {
    await this.producer.produce(topic, JSON.stringify(payload));
  }

  async consumeEvent(payload: MessageFromKafka) {
    const transactionId = payload.transactionId;
    const transaction = await Transaction.findById(transactionId);
    const indexService = transaction.services.indexOf(payload.service);

    let doc = {
      ...payload.data,
      transactionId,
    };

    switch (payload.type) {
      case true:
        if (indexService !== transaction.successFlow.length - 1) {
          const nextService = transaction.services[indexService + 1];
          transaction.status = payload.message;
          await transaction.save();
          doc.step = payload.step + 1;
          await this.produceEvent(nextService, doc);
        }
        break;
      case false:
        if (indexService !== 0) {
          transaction.status = transaction.failFlow[payload.step];
          await transaction.save();
          const nextService = transaction.services[indexService - 1];
          doc = {
            ...doc,
            type: "REVERT",
          };
          await this.produceEvent(nextService, doc);
        }
        break;
      default:
        break;
    }
  }
}
