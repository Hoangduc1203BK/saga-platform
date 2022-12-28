import { Service } from 'typedi';
import { getConnection } from "typeorm";
import { Product } from '../entities';

@Service()
export class Repository {
    private connection: any;
    constructor() {
        this.connection = getConnection();
    }

    async injectRepository(schema: any) {
        return this.connection.getRepository(schema);
    }

    async getProductRepository() {
        const productRepos = await this.injectRepository(Product);

        return productRepos;
    }
}