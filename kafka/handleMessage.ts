import Container from "typedi";
import { ProducerService } from "./producer/producer";

const producer = Container.get(ProducerService);

const messageTypeToTopicMessage = {
    CREATE_ORDER_COMPLETED: ["ORCHESTRATOR-SERVICE-1"],
    
}

export const handleMessage =async (payload: any) => {
    messageTypeToTopicMessage[payload.topic].forEach(async (topic) => {
       await producer.produce(topic, JSON.stringify(payload))
    });
}