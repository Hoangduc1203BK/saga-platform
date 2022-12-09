import 'reflect-metadata';
import { OrderService } from './service/order.service';
import * as express from "express";
import * as dotenv from "dotenv";
import * as mongoose from "mongoose";
import Container from 'typedi';
import { OrderController } from './controller/order.controller';
import { HttpErrorHandler } from './exception/handleError';
import { ConsumerService } from './../../kafka/consumer/consumer';
import { handleOrder } from './event';
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
    const port = process.env.PORT || 3010;

    const consumer = new ConsumerService();
    consumer.addTopics(['ORDER-SERVICE-3']).then(async (result) => {
        await consumer.consume(async (message) => {
            await handleOrder(message);
        })
    })

    const orderService = Container.get(OrderService)

    app.use('/order', OrderController(orderService));
    app.use(HttpErrorHandler)

    app.listen(port, () => {
        console.log('App listen on port ' + port);
    });
}

