import { Router } from "express";
import { ProductService } from "../service/product.service";

export function ProductController(productService: ProductService) {
  const router = Router();

  router.post("/", async (req, res, next) => {
    try {
      const payload = req.body;
      const result = await productService.createProduct(payload);

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      const result = await productService.getProduct(id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      const result = await productService.updateProduct(id, req.body);

      res.json(result);
    } catch (error) {
        next(error);
    }
  });

  return router;
}
