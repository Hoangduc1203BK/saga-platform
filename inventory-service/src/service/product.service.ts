import { Service } from "typedi";
import { CreateProductDto } from "../controller/create-product.dto";
import { Product } from "../model/product.model";
@Service()
export class ProductService {
  constructor() {}

  async createProduct(data: CreateProductDto) {
    const product = new Product(data);
    const result = await product.save();

    return result;
  }

  async getProduct(id: string) {
    try {
      const product = await Product.findById(id);

      return product;
    } catch (error) {
      throw new Error("Product not found");
    }
  }

  async updateProduct(id: string, data: any) {
    try {
      let result = await Product.findByIdAndUpdate({ _id: id }, data, {
        new: true,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
}
