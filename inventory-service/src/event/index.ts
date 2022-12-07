import { checkInventory } from "./check-invenotry";
export const handleEvent = async (message: any) => {
    const topic = message.topic
    const payload = JSON.parse(message.value);
    await checkInventory(topic,payload)
}