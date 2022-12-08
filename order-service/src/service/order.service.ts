import { CreateOrderDto } from "../controller/order.dto";
import { Service } from "typedi";
import { Order } from "../model/order.model";
import { v4 as uuidv4 } from 'uuid';
@Service()
export class OrderService {
    constructor() {}

    async createOrder(payload: CreateOrderDto) {
        const order = new Order(payload);
        const result = await order.save();

        return result;
    }

    async getOrder(id: string) {
        const result = await Order.findOne({_id: id});

        if(!result) {
            throw new Error('Order not found');
        }

        return result;
    }

    async updateOrder(id: string, data: any) {
        const order = await this.getOrder(id);
        const result = await Order.findByIdAndUpdate(order.id, data );

        return result;
    }
}