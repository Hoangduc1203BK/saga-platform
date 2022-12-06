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
    const orchestratorTopic = [{ topic: "ORCHESTRATOR-SERVICE-1", partitions: 1, replicationFactor: 1 }];
    this.producer.createTopic(orchestratorTopic)
  }

  async createTransaction(payload: OrchestratorDto) {
    const { services, data } = payload;
    const transaction = new Transaction(payload);

    const result = await transaction.save();
    const doc = {
      id: result._id,
      ...data,
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

  async consumeEvent(topic: string, payload: MessageFromKafka) {
    const transactionId = payload.transactionId;
    const transaction = await Transaction.findById(transactionId);
    const indexService = transaction.services.indexOf(topic);
    switch (payload.type) {
      case true:
        if (indexService !== transaction.successFlow.length - 1) {
          const nextService = transaction[indexService + 1];
          const doc = {
            ...payload.data,
            transactionId,
          };
          await this.produceEvent(nextService, doc);
        }
        break;
      case false:
        if (indexService !== transaction.failFlow[0]) {
          const nextService = transaction[indexService - 1];
          const doc = {
            ...payload.data,
            transactionId,
          };
          await this.produceEvent(nextService, doc);
        }
        break;
      default:
        break;
    }
  }
}
