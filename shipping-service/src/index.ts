import 'reflect-metadata';
import * as express from "express";
import * as dotenv from "dotenv";
import * as mongoose from "mongoose";
import { ConsumerService } from './../../kafka/consumer/consumer';
import { handleShipping } from './event';
import { TOPIC } from './types/topic';
dotenv.config();

mongoose.connect(process.env.DB_URL)
.then(() => {
    console.log('Connect to db successfully');
})
.then(() => Main())
.catch(err => console.log(err));
const Main = async () => {
    const app = express();
    app.use(express.json());
    const port = process.env.PORT;

    const consumer = new ConsumerService();
    consumer.addTopics([TOPIC.SHIPPING]).then(async (result) => {
        await consumer.consume(async (message) => {
            await handleShipping(message);
        })
    })


    app.listen(port, () => {
        console.log('App listen on port ' + port);
    });
}

