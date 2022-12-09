import { MESSAGE_TYPE } from './../../../orchestrator-service/types/message';
import { handleMessage } from './../../../kafka/handleMessage';
import Container from "typedi";
import { ShippingService } from "../service/shipping.service";
import { SHIPPING_TOPIC } from '../types/topic';

export const handleShipping = async (message: any) => {
    const messageData = JSON.parse(message.value);
    const { name, phoneNumber, address, price, amount, productName, transactionId, step } = messageData;

    const shippingService = Container.get(ShippingService);
    const doc = {
        name,
        product: productName,
        amount,
        totalPrice: amount * price,
        phoneNumber,
        address,
    }

    try {
        await shippingService.createShipping(doc);
        const messageProduce = {
            topic: SHIPPING_TOPIC.SHIPPING_COMPLETED,
            payload: {
                service: message.topic,
                transactionId,
                message: SHIPPING_TOPIC.SHIPPING_COMPLETED,
                type: MESSAGE_TYPE.SUCCESS,
                step,
                data: messageData,
            }
        }
        await handleMessage(messageProduce)
    } catch (error) {
        const messageProduce = {
            topic: SHIPPING_TOPIC.SHIPPING_FAIL,
            payload: {
                service: message.topic,
                transactionId,
                message:  SHIPPING_TOPIC.SHIPPING_FAIL,
                type: MESSAGE_TYPE.FAIL,
                step,
                data: messageData,
            }
        }

        await handleMessage(messageProduce)
    }
}