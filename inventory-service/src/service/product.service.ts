import {
  EntityManager,
  getConnection,
  Transaction,
  TransactionManager,
} from "typeorm";
import Container, { Service } from "typedi";
import { Repository } from "../repository/repository";
import { CreateProductDto } from "../controller/create-product.dto";
import { Product } from "../entities";
import { RedisService } from "../../redis/redis";
import { TOPIC } from "../types/topic";
@Service()
export class ProductService {
  private productRepos: any;
  private redisService: any;
  constructor() {
    const repository = Container.get(Repository);
    this.productRepos = repository.getProductRepository();
    this.redisService = Container.get(RedisService);
  }

  async listProduct() {
    const result = await (await this.productRepos).find();

    await Promise.all(
      result.map(async (p) => {
        await this.redisService.setService(TOPIC.INVENTORY, p);
      })
    );

    return result;
  }

  async createProduct(data: CreateProductDto) {
    const product = await (
      await this.productRepos
    ).findOne({ where: { name: data.name } });
    if (product) {
      throw new Error("Product already exists");
    }

    const result = await (await this.productRepos).save(data);

    return result;
  }

  async getProduct(id: string) {
    const result = await this.redisService.getService(id);
    if (!result.id) {
      const product = await (
        await this.productRepos
      ).findOne({ where: { id } });

      if (!product) {
        throw new Error("product not found");
      }

      await this.redisService.setService(TOPIC.INVENTORY, product);
      return product;
    }
    return result;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async updateProduct(
    id: string,
    data: any,
    @TransactionManager() manager: EntityManager = null
  ) {
    const product = await this.getProduct(id);

    const result = await manager.getRepository(Product).save({id, ...product,...data});
    await this.redisService.updateService(id, result);

    return result;
  }
}
