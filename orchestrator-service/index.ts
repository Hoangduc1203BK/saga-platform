import { handleMessage } from './event/index';
import { ConsumerService } from './../kafka/consumer/consumer';
import 'reflect-metadata';
import * as express from 'express';
import * as dotenv from 'dotenv';
import { OrchestratorController } from './controller/orchestrator.controller';
import { Orchestrator } from './orchestrator/orchestrator';
import Container from 'typedi';
import mongoose from 'mongoose';
dotenv.config();
mongoose.connect(process.env.DB_URL)
.then(() => {
    console.log('Connect to db successfully');
})
.then(() => Main());
const Main = async () => {
    const app = express();
    app.use(express.json());
    const port = process.env.PORT;
    const orchestrator =  new Orchestrator();
    const consumer = new ConsumerService();
    consumer.addTopics(['ORCHESTRATOR-SERVICE-1']).then(async (result) => {
        await consumer.consume(async (message) => {
            await handleMessage(JSON.parse(message))
        })
    })

    app.use('/start-transaction', OrchestratorController(orchestrator));
    app.listen(port, () => {
        console.log('App listening on port ' + port);
    });
}