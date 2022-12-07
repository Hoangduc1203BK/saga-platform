import { Container } from 'typedi';
import * as express from "express";
import * as dotenv from "dotenv";
import { Config } from "./config/config";
import { Database } from "./database/database";
import { UserController } from "./controller/user.controller";
import { UserService } from './service/user.service';
import { HttpErrorHandler } from './exception/handle_error';
import { ConsumerService } from '../../kafka/consumer/consumer';
import { handlePayment } from './event';

dotenv.config();
const config = new Config();
const postgresDB = new Database(config);
postgresDB.init()
.then(() => console.log('Connected to database successfully'))
.then(() => Main())
.catch(err => console.log(err));
const Main = async () => {
  const app = express();
  app.use(express.json());
  app.disable("x-powered-by");
  const port = process.env.PORT;
  const userService = Container.get(UserService);
  const consumer = new ConsumerService();

  consumer.addTopics(["PAYMENT-SERVICE"]).then(async (result) => {
    await consumer.consume(async (message) => {
        await handlePayment(message);
    })
  })

  app.use('/user', UserController(userService));
  app.use(HttpErrorHandler);

  app.listen(port, () => {
    console.log("App listening on port " + port);
  });
};

