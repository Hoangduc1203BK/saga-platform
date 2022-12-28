import { MESSAGE_TYPE } from "./../../../orchestrator-service/types/message";
import { handleMessage } from "./../../../kafka/handleMessage";
import Container from "typedi";
import { OrderService } from "../service/order.service";
import { ORDER_TOPIC, TOPIC } from "../types/topic";
import { v4 as uuidv4 } from "uuid";
import { RedisService } from "../../redis/redis";

export const handleOrder = async (message: any) => {
  const orderService = Container.get(OrderService);
  const redisService = Container.get(RedisService);
  const data = JSON.parse(message.value);

  switch (data.topic) {
    case "SUCCESS_TRANSACTION":
      const { userId, transactionId, productId, amount } = data.payload;
      const doc = {
        userId,
        transactionId,
        productId,
        amount,
      };
      try {
        await orderService.createOrder(doc);
      } catch (error) {
        const result = await orderService.createOrder(doc);
        if(!result._id) {
          const msgToKafka = {
            topic: 'REFRESH_TRANSACTION',
            payload: {
              ...data.payload,
              type: 'REFRESH'
            }
          }
          await handleMessage(msgToKafka, [TOPIC.ORCHESTRATOR]);
        }
      }
      break;
    case "FAIL_TRANSACTION":
      await redisService.del(data.payload._id);
      break;
    default:
      const body = {
        _id: uuidv4(),
        ...data,
        transactionId: data.id,
      };
  
      delete body.id;
  
      await redisService.setService(TOPIC.ORDER, body);
  
      const payload = {
        topic: ORDER_TOPIC.CREATE_ORDER_COMPLETED,
        payload: {
          service: message.topic,
          transactionId: data.id,
          message: ORDER_TOPIC.CREATE_ORDER_COMPLETED,
          type: MESSAGE_TYPE.SUCCESS,
          step: data.step,
          data: {
            ...body,
          },
        },
      };
      
      await handleMessage(payload, [TOPIC.ORCHESTRATOR]);
  }
};
