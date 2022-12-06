import { Router } from "express";
import { OrderService } from "../service/order.service";

export function OrderController(orderService: OrderService) {
    const router = Router();

    router.post('/', async (req, res) => {
        const payload = req.body;
        const result = await orderService.createOrder(payload);

        return res.json(result);
    })
    return router
}