import * as express from "express";
import  axios from "axios";
import * as Queue from 'bull';
import { RedisService } from "./redis/redis";
const main = async () => {
    const app =  express();
    app.use(express.json());
    const port = 8000;

    const users = await axios.get('http://localhost:3003/user');
    const ids = users.data.map((el: any) => el.id);
    const queue = new Queue('saga', {redis: { port: 6375, host: '127.0.0.1'}});
    const redisService = new RedisService();

    await Promise.all(['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18'].map(async (id: string) => {
        await queue.add({id: id});
    }))

    queue.process(async (job) => {
        const { id } = job;
        const doc = 
            {
                services: ["ORDER-SERVICE-3", "INVENTORY", "PAYMENT-SERVICE", "SHIPPING-SERVICE"],
                successFlow: ["CREATE-ORDER_COMPLETED", "CHECK_INVENTORY_COMPLETED", "PAYMENT_COMPLETED", "SHIPPING_COMPLETED"],
                failFlow: ["CREATE_ORDER_FAIL", "CHECK_INVENTORY_FAIL", "PAYMENT_FAIL", "SHIPPING_FAIL"],
                data: {
                    userId: id,
                    productId: 1,
                    amount: 1
                }
            }
        await axios.post('http://localhost:3000/start-transaction', doc);
    })

    
    app.listen(port, () => {
        console.log('App listening on port ' + port);
    })
}

main().catch(err=> console.log(err));