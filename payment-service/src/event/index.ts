import { handleMessage } from './../../../kafka/handleMessage';
import { Container } from 'typedi';
import { UserService } from '../service/user.service';

export const handlePayment = async (message: any) => {
    const topic = message.topic;
    const data = JSON.parse(message.value);
    const { userId, amount, price, transactionId, step } = data;
    const userService = Container.get(UserService);
    const user = await userService.getUser(userId);
    const totalPrice = price * amount;

    let failData = {
        topic: 'PAYMENT_FAIL',
        payload: {
            service: topic,
            transactionId,
            message: 'PAYMENT-FAIL',
            type: false,
            step,
            data
        }
    }

    if(data.type !== 'REVERT') {
        try {
            if(user.accountBalance > totalPrice) {
                await userService.updateUser(userId, { accountBalance: user.accountBalance - totalPrice});
                const messageProduce = {
                    topic: 'PAYMENT_COMPLETED',
                    payload: {
                        service: topic,
                        transactionId,
                        message: 'PAYMENT-COMPLETED',
                        type: true,
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