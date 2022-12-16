import { MESSAGE_TYPE } from "./../../../orchestrator-service/types/message";
import { handleMessage } from "./../../../kafka/handleMessage";
import Container from "typedi";
import { OrderService } from "../service/order.service";
import { ORDER_TOPIC } from "../types/topic";
import { v4 as uuidv4 } from "uuid";
import { RedisService } from "../../redis/redis";

export const handleOrder = async (message: any) => {
  const orderService = Container.get(OrderService);
  const redisService = Container.get(RedisService);
  const data = JSON.parse(message.value);

  if (data.topic === "SUCCESS_TRANSACTION") {
    const { userId, transactionId, productId, amount } = data.payload;
    const doc = {
      userId,
      transactionId,
      productId,
      amount,
    };
    await orderService.createOrder(doc);

  } else if (data.type === "REVERT") {
    const orderId = data._id;
    if (orderId) {
      const order = await redisService.getService(orderId);
      order.dtime = Date.now();
      await redisService.setService("ORDER-SERVICE-3", order);
      const payload = {
        topic: ORDER_TOPIC.CREATE_ORDER_FAIL,
        payload: {
          service: message.topic,
          transactionId: data.transactionId,
          message: ORDER_TOPIC.CREATE_ORDER_FAIL,
          type: MESSAGE_TYPE.FAIL,
          step: data.step,
          data: order,
        },
      };
      await handleMessage(payload);
    }
  } else {
    const doc = {
      _id: uuidv4(),
      ...data,
      transactionId: data.id,
    };

    delete doc.id;

    await redisService.setService("ORDER-SERVICE-3", doc);

    const payload = {
      topic: ORDER_TOPIC.CREATE_ORDER_COMPLETED,
      payload: {
        service: message.topic,
        transactionId: data.id,
        message: ORDER_TOPIC.CREATE_ORDER_COMPLETED,
        type: MESSAGE_TYPE.SUCCESS,
        step: data.step,
        data: {
          ...doc,
        },
      },
    };
    await handleMessage(payload);
  }
};
