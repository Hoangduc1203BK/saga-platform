import { handleMessage } from './../../../orchestrator-service/event/index';
import { Container } from 'typedi';
import { UserService } from '../service/user.service';

export const handlePayment = async (message: any) => {
    const topic = message.topic;
    const data = JSON.parse(message.value);
    console.log(data);
    const { userId, amount, price, transactionId, step } = data;
    const userService = Container.get(UserService);
    const user = await userService.getUser(userId);
    const totalPrice = price * amount;

    let messageProduce: any;

    if(data.type !== 'REVERT') {
        try {
            if(user.accountBalance > totalPrice) {
                console.log(1);
                messageProduce = {
                    topic: 'PAYMENT_COMPLETED',
                    payload: {
                        serice: topic,
                        transactionId,
                        message: 'PAYMENT-COMPLETED',
                        type: true,
                        step,
                        data: {
                            ...data,
                            phone: user.phoneNumber,
                            address: user.address,
                        }
                    }
                }
            }else {
                console.log(2);
                messageProduce = {
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
            }
    
        } catch (error) {
            messageProduce = {
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
        }
    }else {
        // const result = await userService.updateUser(userId, { accountBalance: user.accountBalance + totalPrice});

        // messageProduce = {
        //     topic: 'PAYMENT-FAIL',
        //     payload: {
        //         service: topic,
        //         transactionId,
        //         mes
        //     }
        // }
    }

    await handleMessage(messageProduce);
}