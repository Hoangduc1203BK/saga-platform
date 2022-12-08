import { Router } from 'express';
import { ShippingService } from '../service/shipping.service';
import { CreateShippingDto } from './create-shipping.dto';

export function ShippingController(shippingService: ShippingService) {
    const router = Router();

    router.get('/:id', async (req, res) => {
        const id = req.params.id;
        const result = await shippingService.getShipping(id);

        return res.json(result);
    })

    router.post('/', async (req, res) => {
        const payload = req.body as CreateShippingDto;
        const result = await shippingService.createShipping(payload);

        return res.json(result);
    })

    return router;
}