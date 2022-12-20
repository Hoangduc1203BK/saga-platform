import { MESSAGE_TYPE } from "./../../../orchestrator-service/types/message";
import { handleMessage } from "./../../../kafka/handleMessage";
import { Container } from "typedi";
import { UserService } from "../service/user.service";
import { PAYMENT_TOPIC, TOPIC } from "../types/topic";
import { RedisService } from "../../redis/redis";

export const handlePayment = async (message: any) => {
  const topic = message.topic;
  const data = JSON.parse(message.value);
  const { userId, amount, price, transactionId, step } = data;
  const redisService = Container.get(RedisService);
  const userService = Container.get(UserService);
  const user = await userService.getUser(userId);
  const totalPrice = price * amount;

  let failData = {
    topic: PAYMENT_TOPIC.PAYMENT_FAIL,
    payload: {
      service: topic,
      transactionId,
      message: PAYMENT_TOPIC.PAYMENT_FAIL,
      type: MESSAGE_TYPE.FAIL,
      step,
      data,
    },
  };

  if (data.topic === "SUCCESS_TRANSACTION") {
    const { amount, price, userId } = data.payload;
    const user = await userService.getUser(userId);
    const doc = {
      ...user,
      accountBalance: user.accountBalance - amount * price,
    };

    try {
      await userService.updateUser(user.id, doc);
    } catch (error) {
      const result = await userService.updateUser(user.id, doc);
      if(!result.id) {
        const msgToKafka = {
          topic: 'REFRESH_TRANSACTION',
          payload: {
            ...data,
            type: 'REFRESH'
          }
        }
        await handleMessage(msgToKafka, [TOPIC.ORCHESTRATOR]);
      }
    }

  } else if (data.topic === "FAIL_TRANSACTION") {
    //redis
    await redisService.del(transactionId);

  } else {
    try {
      if (user.accountBalance > totalPrice) {
        //redis
        const doc = {
          transactionId: transactionId,
          userId: user.id,
          totalPrice: totalPrice,
        };
        await redisService.setService("PAYMENT-SERVICE", doc);

        const messageProduce = {
          topic: PAYMENT_TOPIC.PAYMENT_COMPLETED,
          payload: {
            service: topic,
            transactionId,
            message: PAYMENT_TOPIC.PAYMENT_COMPLETED,
            type: MESSAGE_TYPE.SUCCESS,
            step,
            data: {
              ...data,
              name: user.name,
              phoneNumber: user.phoneNumber,
              address: user.address,
            },
          },
        };
        await handleMessage(messageProduce, [TOPIC.ORCHESTRATOR]);
        
      } else {
        await handleMessage(failData, [TOPIC.ORCHESTRATOR]);
      }
    } catch (error) {
      await handleMessage(failData, [TOPIC.ORCHESTRATOR]);
    }
  }
};
