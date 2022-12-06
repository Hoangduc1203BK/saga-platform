import { Router } from "express";
import { OrchestratorDto } from "../dto/orchestrator.dto";
import { Orchestrator } from "../orchestrator/orchestrator";

export function OrchestratorController(orchestrator: Orchestrator) {
    const router = Router();

    router.post('/', async (req, res) => {
        const payload = req.body as OrchestratorDto;
        const result = await orchestrator.createTransaction(payload);

        return res.json(result);
    })
    return router;
}