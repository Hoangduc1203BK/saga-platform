import * as Kafka from "kafka-node";
import { Service } from 'typedi';
const Producer = Kafka.Producer;
const client = new Kafka.KafkaClient();

@Service()
export class ProducerService {
  private producer: any;
  private producerReady: any;
  constructor() {
    this.producer = new Producer(client);
    this.bindListener();
  }

  bindListener() {
    this.producerReady = new Promise((resolve, rejects) => {
      this.producer.on("ready", () => {
        console.log("producer ready...");
        resolve(this.producer);
      });

      this.producer.on("err", (err) => {
        console.log("producer err ", err);

        rejects(err);
      });
    });
  }

  async produce(topic: any, messages: any, partition = 0) {
    return this.producerReady.then(async (producer: any) => {
      const payload = [{ topic, messages, partition }];
      return new Promise((resolve, reject) => {
        producer.send(payload, function (err, data) {
          if (err) {
            console.log("Error while producing data in this service");
            reject(err);
          }
          resolve(data);
        });
      });
    });
  }

  async createTopic(topics: any[]) {
    return this.producerReady.then(async (producer) => {
      try {
        const result = client.createTopics(topics, (err, result) => {
          return;
        });

        return result;
      } catch (error) {
        console.log("Error while creating a topic");
        throw error;
      }
    });
  }
}
