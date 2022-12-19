import Container from "typedi";
import { ProducerService } from "./producer/producer";

const producer = Container.get(ProducerService);

export const handleMessage =async (payload: any, topics: any) => {
    topics.forEach(async (topic:any) => {
        await producer.produce(topic, JSON.stringify(payload))
    })
}