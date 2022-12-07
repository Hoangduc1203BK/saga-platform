import { Orchestrator } from "../orchestrator/orchestrator"

export const handleMessage = async (message) => {
    const orchestrator = new Orchestrator();
    const { payload } = message;
    await orchestrator.consumeEvent(payload);
}