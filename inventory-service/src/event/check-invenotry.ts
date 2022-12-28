import { MESSAGE_TYPE } from "./../../../orchestrator-service/types/message";
import { handleMessage } from "./../../../kafka/handleMessage";
import Container from "typedi";
import { ProductService } from "../service/product.service";
import { INVENTORY_TOPIC, TOPIC } from "../types/topic";
import { RedisService } from "../../redis/redis";
export const checkInventory = async (service: string, payload: any) => {
  const productService = Container.get(ProductService);
  const redisService = Container.get(RedisService);
  const { productId, amount, transactionId, type } = payload;
  let topic: any;

  let failData = {
    topic: INVENTORY_TOPIC.CHECK_INVENTORY_FAIL,
    payload: {
      service: service,
      transactionId,
      message: INVENTORY_TOPIC.CHECK_INVENTORY_FAIL,
      type: MESSAGE_TYPE.FAIL,
      step: payload.step,
      data: payload,
    },
  };

  if (payload.topic === "SUCCESS_TRANSACTION") {
    const { productId } = payload.payload;
    const cacheData = await redisService.getService(productId);
    try {
      await productService.updateProduct(cacheData.id, cacheData);
    } catch (error) {
      const result = await productService.updateProduct(cacheData.productId, {
        inventory: cacheData.amount,
      });

      if (!result) {
        const msgToKafka = {
          topic: "REFRESH_TRANSACTION",
          payload: {
            ...payload,
            type: "REFRESH",
          },
        };
        await handleMessage(msgToKafka, [TOPIC.ORCHESTRATOR]);
      }
    }
  } else if (payload.topic === "FAIL_TRANSACTION") {
    //redis
    await redisService.del(payload.payload.transactionId);
  } else {
    try {
      const product = await redisService.getService(productId);
      console.log(product);
      if (product.inventory >= amount) {
        //redis
        const doc = {
          ...product,
          inventory: product.inventory - amount,
        };

        await redisService.updateService(product.id, doc);

        topic = {
          topic: INVENTORY_TOPIC.CHECK_INVENTORY_COMPLETED,
          payload: {
            service: service,
            transactionId,
            message: INVENTORY_TOPIC.CHECK_INVENTORY_COMPLETED,
            type: MESSAGE_TYPE.SUCCESS,
            step: payload.step,
            data: {
              ...payload,
              productName: product.name,
              price: product.price,
            },
          },
        };

        await handleMessage(topic, [TOPIC.ORCHESTRATOR]);
      } else {
        await handleMessage(failData, [TOPIC.ORCHESTRATOR]);
      }
    } catch (error) {
      await handleMessage(failData, [TOPIC.ORCHESTRATOR]);
    }
  }
};
