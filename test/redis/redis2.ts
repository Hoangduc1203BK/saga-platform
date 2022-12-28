import { createClient } from "redis";

const Services = (service: string, key: string) => `${service}:${key}`;
export class RedisService2 {
  private client: any;
  constructor() {
    this.client = createClient({ url: "redis://127.0.0.1:6371" });
  }

  async del(key: string) {
    const delKey = `INVENTORY:${key}`;
    await this.client.multi().del(delKey).exec();
  }

  async setService(key: string, data: any) {
    for (let [k, v] of Object.entries(data)) {
      await this.client
        .multi()
        .hset(Services(key, data.id), k, JSON.stringify(v))
        .exec();
    }

    return true;
  }

  async getService(key: string) {
    const cacheData = await this.client
      .multi()
      .hgetall(`INVENTORY:${key}`)
      .exec();

    let result = {} as any;
    for (let [k, v] of Object.entries(cacheData[0][1])) {
      result[k] = JSON.parse(v as string);
    }

    return result;
  }

  async updateService(key: string, data: any) {
    await this.del(key);

    await this.setService("INVENTORY", data);
  }
}
