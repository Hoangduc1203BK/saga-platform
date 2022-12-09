import { MESSAGE_TYPE } from './../../../orchestrator-service/types/message';
import { handleMessage } from './../../../kafka/handleMessage';
import { Container } from 'typedi';
import { UserService } from '../service/user.service';
import { PAYMENT_TOPIC } from '../types/topic';

export const handlePayment = async (message: any) => {
    const topic = message.topic;
    const data = JSON.parse(message.value);
    const { userId, amount, price, transactionId, step } = data;
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
            data
        }
    }

    if(data.type !== 'REVERT') {
        try {
            if(user.accountBalance > totalPrice) {
                await userService.updateUser(userId, { accountBalance: user.accountBalance - totalPrice});
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
                        }
                    }
                }
                await handleMessage(messageProduce)
            }else { 
                await handleMessage(failData);
            }
    
        } catch (error) {
            await handleMessage(failData);
        }
    }else {
        await userService.updateUser(userId, { accountBalance: user.accountBalance + totalPrice});

        await handleMessage(failData);
    }
}