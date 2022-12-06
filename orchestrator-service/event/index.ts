import { Orchestrator } from "../orchestrator/orchestrator"

export const handleMessage = async (message) => {
    const orchestrator = new Orchestrator();
    const { topic, payload } = message;
    console.log('aaa',message);
    await orchestrator.consumeEvent(topic, JSON.parse(payload));
}