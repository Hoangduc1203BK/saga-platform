import Container from "typedi";
import { ProducerService } from "./producer/producer";

const producer = Container.get(ProducerService);

const messageTypeToTopicMessage = {
    CREATE_ORDER_COMPLETED: ["ORCHESTRATOR-SERVICE-2"],
    CREATE_ORDER_FAIL: ["ORCHESTRATOR-SERVICE-2"],
    CHECK_INVENTORY_COMPLETED:["ORCHESTRATOR-SERVICE-2"],
    CHECK_INVENTORY_FAIL : ["ORCHESTRATOR-SERVICE-2"],
    PAYMENT_FAIL: ["ORCHESTRATOR-SERVICE-2"],
    PAYMENT_COMPLETED: ["ORCHESTRATOR-SERVICE-2"],
    SHIPPING_COMPLETED: ["ORCHESTRATOR-SERVICE-2"],
    SHIPPING_FAIL: ["ORCHESTRATOR-SERVICE-2"]
}

export const handleMessage =async (payload: any) => {
    messageTypeToTopicMessage[payload.topic].forEach(async (topic) => {
       await producer.produce(topic, JSON.stringify(payload))
    });
}