import { Router } from 'express';
import { ProductService } from '../service/product.service';

export function ProductController(productService: ProductService) {
    const router = Router();

    router.post('/', async (req, res) => {
        const payload = req.body;
        const result = await productService.createProduct(payload);

        return res.json(result);
    })

    router.get('/:id', async (req, res) => {
        const id =req.params.id;
        const result = await productService.getProduct(id);

        return res.json(result);
    })

    router.patch('/:id', async (req, res) => {
        const id = req.params.id;
        const result = await productService.updateProduct(id, req.body);

        return res.json(result);
    })

    return router;
}