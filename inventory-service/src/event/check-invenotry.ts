import { MESSAGE_TYPE } from './../../../orchestrator-service/types/message';
import { handleMessage } from "./../../../kafka/handleMessage";
import Container from "typedi";
import { ProductService } from "../service/product.service";
import { INVENTORY_TOPIC } from '../types/topic';
export const checkInventory = async (service: string, payload: any) => {
  const productService = Container.get(ProductService);
  const { productId, amount, transactionId, type } = payload;
  const product = await productService.getProduct(productId);
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

  if (type !== "REVERT") {
    try {
      if (product.inventory > amount) {
        await productService.updateProduct(productId, {
          inventory: product.inventory - amount,
        });
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

        await handleMessage(topic);
      } else {
        await handleMessage(failData);
      }
    } catch (error) {
      await handleMessage(failData);
    }
  } else {
    await productService.updateProduct(productId, { inventory: product.inventory + amount });
    await handleMessage(failData);
  }
};
