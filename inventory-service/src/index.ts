import { ConsumerService } from './../../kafka/consumer/consumer';
import 'reflect-metadata';
import * as express from "express";
import * as dotenv from "dotenv";
import * as mongoose from "mongoose";
import Container from 'typedi';
import { ProductService } from './service/product.service';
import { ProductController } from './controller/product.controller';
import { handleEvent } from './event';
import { HttpErrorHandler } from './exception/handle-error';
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
    const port = process.env.PORT || 3011;

    /**********************************************************/
    const productService = Container.get(ProductService);
    app.use('/product', ProductController(productService));


    const consumer = new ConsumerService()
    consumer.addTopics([TOPIC.INVENTORY]).then(async (result) => {
        await consumer.consume(async (message) => {
            await handleEvent(message);
        })
    });

    app.use(HttpErrorHandler)

    app.listen(port, () => {
        console.log('App listen on port ' + port);
    });
}