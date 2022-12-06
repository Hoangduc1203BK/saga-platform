import * as kafka from 'kafka-node';
import { Service } from 'typedi';
let defaultOptions = {
    fromOffset: true, 
    autoCommit: true,
  };
  
const client =new kafka.KafkaClient();
const Consumer = kafka.Consumer;

@Service()
export class ConsumerService {
    private consumer: any;
    private consumerReady: any;
    constructor(topics?: any) {
        this.bindEventListeners(topics)
    }

    bindEventListeners(topics: any) {
        this.consumerReady = new Promise((resolve, reject) => {
            try {
                this.consumer = new Consumer(client, [], defaultOptions);

                this.consumer.on('error', (err) => {
                    console.log(`error occured on consumer group ${topics}`);
                  })
                  resolve(this.consumer);
            } catch (error) {
                reject(error)
            }
        })
    }

    async addTopics(topics: any) {
        return new Promise((resolve, reject) => {
            this.consumerReady.then((consumer) => {
                console.log('adding topics', topics);
                consumer.addTopics(topics, (err,result) => {
                    console.log('topics added', result);
                    resolve(result);
                })
            }).catch((err) => {
                console.log('error while creating topic', err);
            })
        })
    }

    async consume(callback: any) {
        return new Promise((resolve, reject) => {
            this.consumerReady.then((consumer) => {
                console.log('consumer ready...');
    
                consumer.on('message', (message) => {
                    callback(message)
                })
            })
            .catch((error: any) => {
                console.log('error while consuming', error);
            })
        })

    }
}