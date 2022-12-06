import { handleMessage } from './../../../kafka/handleMessage';
import Container from 'typedi';
import { OrderService } from '../service/order.service';
export const handleOrder = async (message: any) => {
    const orderService = Container.get(OrderService);
    const doc = {
        ...message,
        transactionId: message.id,
    }
    const result = await orderService.createOrder(doc);
    const payload = {
        topic: 'CREATE_ORDER_COMPLETED',
        payload: {
            transactionId: message.id,
            message: 'CREATE-ORDER-COMPLETED',
            type: true,
            data: {
                orderId: result._id,
                ...result["_doc"],
            }
        }
    }
    
    await handleMessage(payload)
}