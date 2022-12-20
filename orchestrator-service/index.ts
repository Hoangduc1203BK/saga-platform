import "reflect-metadata";
import { handleMessage } from "./event/index";
import { ConsumerService } from "./../kafka/consumer/consumer";
import * as express from "express";
import * as dotenv from "dotenv";
import { OrchestratorController } from "./controller/orchestrator.controller";
import { Orchestrator } from "./orchestrator/orchestrator";
import mongoose from "mongoose";
import { HttpErrorHandler } from "./exception/handle-error";
import { TOPIC } from "./types/topic";
dotenv.config();
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("Connect to db successfully");
  })
  .then(() => Main());
const Main = async () => {
  const app = express();
  app.use(express.json());
  const port = process.env.PORT;
  const orchestrator = new Orchestrator();
  const consumer = new ConsumerService();
  consumer.addTopics([TOPIC]).then(async (result) => {
    await consumer.consume(async (message) => {
      await handleMessage(JSON.parse(message.value));
    });
  });

  app.use("/start-transaction", OrchestratorController(orchestrator));
  app.use(HttpErrorHandler);
  app.listen(port, () => {
    console.log("App listening on port " + port);
  });
};
