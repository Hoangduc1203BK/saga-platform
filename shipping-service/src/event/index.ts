import { MESSAGE_TYPE } from "./../../../orchestrator-service/types/message";
import { handleMessage } from "./../../../kafka/handleMessage";
import Container from "typedi";
import { ShippingService } from "../service/shipping.service";
import { SHIPPING_TOPIC, TOPIC } from "../types/topic";
import { RedisService } from "../redis/redis";
import { v4 as uuidv4 } from "uuid";
export const handleShipping = async (message: any) => {
  const messageData = JSON.parse(message.value);
  const shippingService = Container.get(ShippingService);
  const redisService = Container.get(RedisService);

  if (messageData.topic === "SUCCESS_TRANSACTION") {
    const { name, phoneNumber, address, price, amount, productName } =
      messageData.payload;
    const doc = {
      _id: uuidv4(),
      name,
      product: productName,
      amount,
      totalPrice: amount * price || 10000,
      phoneNumber,
      address,
    };

    try {
      await shippingService.createShipping(doc);
    } catch (error) {
      const result = await shippingService.createShipping(doc);
      if (!result._id) {
        const msgToKafka = {
          topic: "REFRESH_TRANSACTION",
          payload: {
            ...messageData.payload,
            type: "REFRESH",
          },
        };
        await handleMessage(msgToKafka, [TOPIC.ORCHESTRATOR]);
      }
    }
  } else if (messageData.topic === "FAIL_TRANSACTION") {
    await redisService.del(messageData.payload.transactionId);
  } else {
    const {
      name,
      phoneNumber,
      address,
      price,
      amount,
      productName,
      transactionId,
      step,
    } = messageData;
    const doc = {
      transactionId,
      name,
      product: productName,
      amount,
      totalPrice: amount * price || 10000,
      phoneNumber,
      address,
    };

    try {
      //redis
      await redisService.setService("SHIPPING-SERVICE", doc);
      const messageProduce = {
        topic: SHIPPING_TOPIC.SHIPPING_COMPLETED,
        payload: {
          service: message.topic,
          transactionId,
          message: SHIPPING_TOPIC.SHIPPING_COMPLETED,
          type: MESSAGE_TYPE.SUCCESS,
          step,
          data: messageData,
        },
      };

      await handleMessage(messageProduce, [TOPIC.ORCHESTRATOR]);
    } catch (error) {
      const messageProduce = {
        topic: SHIPPING_TOPIC.SHIPPING_FAIL,
        payload: {
          service: message.topic,
          transactionId,
          message: SHIPPING_TOPIC.SHIPPING_FAIL,
          type: MESSAGE_TYPE.FAIL,
          step,
          data: messageData,
        },
      };

      await handleMessage(messageProduce, [TOPIC.ORCHESTRATOR]);
    }
  }
};
