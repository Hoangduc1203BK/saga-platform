import { createConnection, useContainer } from "typeorm";
import { Config } from "../config/config";
import {Service} from "typedi";
import { Container } from 'typeorm-typedi-extensions';
@Service()
export class Database {
  constructor(private config: Config) {}

  public async init() {
    useContainer(Container)
    const option = this.config.DbOptions;
    
    await createConnection(option);
  }
}
