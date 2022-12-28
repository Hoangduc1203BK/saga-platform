import * as Queue from 'bull';
import  axios from "axios";
export class QueueService {
    private queue: any;
    constructor() {
        this.queue = new Queue('saga', {redis: {port: 6375, host: '127.0.0.1'}});
    }

    async addQueue(data: any) {
        await this.queue.add(data);
    }

    async processQueue() {
        this.queue.process(async (job) => {
            const { id } = job.data;
            console.log(id);

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
    }
}