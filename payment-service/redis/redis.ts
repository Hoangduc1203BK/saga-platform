import { default as Redis} from "ioredis";
import { Service } from "typedi";

const Services = (service: string, key: string) => `${service}:${key}`;
@Service()
export class RedisService {
  private client: any;
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    });

    this.client.on("ready", () => {
      console.log("Redis ready...");
      this.client.on("connect", () => {
        console.log("Redis connection established");
      });
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
    const delKey = `PAYMENT-SERVICE:${key}`;
    await this.client.multi().del(delKey).exec();
  }

  async setService(key: string, data: any) {
    for (let [k, v] of Object.entries(data)) {
      await this.client.multi().hset(
        Services(key, data.transactionId),
        k,
        JSON.stringify(v)
      ).exec();
    }
    return true;
  }

  async getService(key: string) {
    const cacheData = await this.client.multi().hgetall(`PAYMMENT-SERVICE:${key}`).exec();
    const data = cacheData[0][1];

    let result = {} as any;
    for (let [k, v] of Object.entries(data)) {
      result[k] = JSON.parse(v as string);
    }
    return result;
  }
}
