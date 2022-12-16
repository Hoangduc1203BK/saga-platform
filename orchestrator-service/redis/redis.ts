import IORedis from "ioredis";
import { Service } from 'typedi';


const Services = (service: string, key: string) => `${service}:${key}`;
@Service()
export class RedisService {
  private client: any;
  constructor() {
    this.client = new IORedis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    });

    this.client.on("ready", () => {
      console.log("Redis ready...");
      this.client.on("connect", () => {
        console.log("Redis connection established");
      })
    });

    this.client.on("error", (error) => {
      console.log("Redis error: ", error);
    });
  }

  async set(key: string, value: string, ttl?: number) {
    await this.client.set(key, value);

    if (ttl) {
      await this.client.expire(key, ttl);
    }
  }

  async get(key: string) {
    const result = await this.client.get(key);
    return result;
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async setService(key: string, data: any) {
    for(let [k,v] of Object.entries(data)) {
        await this.client.hset(Services(key,data._id),k,JSON.stringify(v));
    }
    return true;
  }

  async getService(key: string) {
    const data = await this.client.hgetall(`ORCHESTRATOR-SERVICE-2:${key}`);

    let result = {} as any;
    for(let [k,v] of Object.entries(data)) {
      result[k] = JSON.parse(v as string);
    }

    return result;
  }
}
