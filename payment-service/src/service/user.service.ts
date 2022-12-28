import { Container } from "typedi";
import { Service } from "typedi";
import { Repository } from "../repository/repository";
import { CreateUserDto } from "../controller/create-user.dto";

@Service()
export class UserService {
  private userRepos: any;
  constructor() {
    const repository = Container.get(Repository);
    this.userRepos = repository.getUserRepository();
  }

  async listUser() {
    const users= await (await this.userRepos).find();

    return users;
  }

  async getUser(id: number) {
    const user = await (await this.userRepos).findOne({ where: { id } });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
  async createUser(data: CreateUserDto) {
    const user = await (await this.userRepos).findOne({ where: { name: data.name } });
    if(user) { 
        throw new Error('User already exists')
    }

    const result = await (await this.userRepos).save(data);

    return result;
  }

  async updateUser(id: number, data: any) {
    const user = await this.getUser(id);

    const doc = {
        ...user,
        ...data,
    }

    const result = await (await this.userRepos).save(doc);

    return result;
  }
}
