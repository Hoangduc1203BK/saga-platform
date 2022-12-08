import { handleMessage } from "./../../../kafka/handleMessage";
import Container from "typedi";
import { ProductService } from "../service/product.service";
export const checkInventory = async (service: string, payload: any) => {
  const productService = Container.get(ProductService);
  const { productId, amount, transactionId, type } = payload;
  const product = await productService.getProduct(productId);
  let topic: any;

  let failData = {
    topic: "CHECK_INVENTORY_FAIL",
    payload: {
      service: service,
      transactionId,
      message: "CHECK-INVENTORY-FAIL",
      type: false,
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
          topic: "CHECK_INVENTORY_COMPLETED",
          payload: {
            service: service,
            transactionId,
            message: "CHECK-INVENTORY-COMPLETED",
            type: true,
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
