import { default as Redis} from "ioredis";
const Services = (service: string, key: string) => `${service}:${key}`;
export class RedisService {
  private client: any;
  constructor() {
    this.client = new Redis({
      host: '127.0.0.1',
      port: 6371,
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

  async set(key: string, value: any, ttl?: number) {
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
    const delKey = `INVENTORY:${key}`;
    await this.client.multi().del(delKey).exec();
  }

  async setService(key: string, data: any) {
    for (let [k, v] of Object.entries(data)) {
      await this.client.multi().hset(Services(key, data.id), k, JSON.stringify(v)).exec();
    }

    return true;
  }

  async getService(key: string) {
    const cacheData = await this.client.multi().hgetall(`INVENTORY:${key}`).exec();
    const data = cacheData[0][1];

    let result = {} as any;
    for (let [k, v] of Object.entries(data)) {
      result[k] = JSON.parse(v as string);
    }

    return result;
  }

  async updateService(key: string, data: any) {
    await this.del(key);

    await this.setService("INVENTORY", data);
  }
}
