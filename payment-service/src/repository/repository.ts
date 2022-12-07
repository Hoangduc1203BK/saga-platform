import { Service } from 'typedi';
import { getConnection } from "typeorm";
import { User } from '../entities';

@Service()
export class Repository {
    private connection: any;
    constructor() {
        this.connection = getConnection();
    }

    async injectRepository(schema: any) {
        return this.connection.getRepository(schema);
    }

    async getUserRepository() {
        const userRepos = await this.injectRepository(User);

        return userRepos;
    }
}