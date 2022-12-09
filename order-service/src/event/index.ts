import { MESSAGE_TYPE } from './../../../orchestrator-service/types/message';
import { handleMessage } from "./../../../kafka/handleMessage";
import Container from "typedi";
import { OrderService } from "../service/order.service";
import { ORDER_TOPIC } from '../types/topic';
export const handleOrder = async (message: any) => {
  const orderService = Container.get(OrderService);
  const data = JSON.parse(message.value);
  let payload: any;
  if (data.type !== "REVERT") {
    const doc = {
      ...data,
      transactionId: data.id,
    };
    const result = await orderService.createOrder(doc);
    payload = {
      topic: ORDER_TOPIC.CREATE_ORDER_COMPLETED,
      payload: {
        service: message.topic,
        transactionId: data.id,
        message: ORDER_TOPIC.CREATE_ORDER_COMPLETED,
        type: MESSAGE_TYPE.SUCCESS,
        step: data.step,
        data: {
          ...result["_doc"],
        },
      },
    };
  } else {
    const orderId = data._id;
    if (orderId) {
      const result = await orderService.updateOrder(orderId, {
        dtime: Date.now(),
      });
      payload = {
        topic: ORDER_TOPIC.CREATE_ORDER_FAIL,
        payload: {
          service: message.topic,
          transactionId: data.transactionId,
          message: ORDER_TOPIC.CREATE_ORDER_FAIL,
          type: MESSAGE_TYPE.FAIL,
          step: data.step,
          data: result,
        },
      };
    }
  }

  await handleMessage(payload);
};
