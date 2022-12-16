import { Router } from "express";
import { OrchestratorDto } from "../dto/orchestrator.dto";
import { Orchestrator } from "../orchestrator/orchestrator";

export function OrchestratorController(orchestrator: Orchestrator) {
  const router = Router();

  router.get("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      const result = await orchestrator.getTransaction(id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  });
  router.post("/", async (req, res, next) => {
    try {
      const payload = req.body as OrchestratorDto;
      const result = await orchestrator.createTransaction(payload);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });
  return router;
}
