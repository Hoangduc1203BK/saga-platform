import { handleMessage } from './../../../kafka/handleMessage';
import Container from "typedi";
import { ShippingService } from "../service/shipping.service";

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
            topic: 'SHIPPING_COMPLETED',
            payload: {
                service: message.topic,
                transactionId,
                message: 'SHIPPING-COMPLETED',
                type: true,
                step,
                data: messageData,
            }
        }
        await handleMessage(messageProduce)
    } catch (error) {
        const messageProduce = {
            topic: 'SHIPPING_FAIL',
            payload: {
                service: message.topic,
                transactionId,
                message: 'SHIPPING-FAIL',
                type: false,
                step,
                data: messageData,
            }
        }

        await handleMessage(messageProduce)
    }
}