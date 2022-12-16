import { Router } from "express";
import { OrderService } from "../service/order.service";

export function OrderController(orderService: OrderService) {
    const router = Router();

    router.get('/:id', async (req, res, next) => {
        try {
            const id = req.params.id;
            const result = await orderService.getOrder(id);

            res.json(result);
        } catch (error) {
            next(error);
        }
    })

    router.post('/', async (req, res) => {
        const payload = req.body;
        const result = await orderService.createOrder(payload);

        return res.json(result);
    })
    return router
}