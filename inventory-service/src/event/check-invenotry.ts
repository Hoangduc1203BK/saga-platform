import { MESSAGE_TYPE } from "./../../../orchestrator-service/types/message";
import { handleMessage } from "./../../../kafka/handleMessage";
import Container from "typedi";
import { ProductService } from "../service/product.service";
import { INVENTORY_TOPIC } from "../types/topic";
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
    const { transactionId } = payload.payload;
    const cacheData = await redisService.getService(transactionId);
    const product = await productService.getProduct(cacheData.productId);
    await productService.updateProduct(cacheData.productId, {
      inventory: product.inventory - cacheData.amount,
    });
  } else if (payload.topic === "FAIL_TRANSACTION") {
    //redis
    await redisService.del(payload.payload.transactionId);
  } else {
    try {
      const product = await productService.getProduct(productId);
      if (product.inventory >= amount) {
        //redis
        const doc = {
          transactionId,
          productId: product._id,
          amount: amount,
        };
        await redisService.setService("INVENTORY-SERVICE", doc);

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

        await handleMessage(topic, ["ORCHESTRATOR-SERVICE-2"]);
      } else {
        await handleMessage(failData, ["ORCHESTRATOR-SERVICE-2"]);
      }
    } catch (error) {
      await handleMessage(failData, ["ORCHESTRATOR-SERVICE-2"]);
    }
  }
};
