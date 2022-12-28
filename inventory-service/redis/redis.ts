// import { default as Redis} from "ioredis";
// import { Service } from "typedi";
// import * as fs from "fs";
// const Services = (service: string, key: string) => `${service}:${key}`;
// @Service()
// export class RedisService {
//   private client: any;
//   private redis: any;
//   constructor() {
//     this.client = new Redis({
//       host: process.env.REDIS_HOST,
//       port: parseInt(process.env.REDIS_PORT),
//     });

//     this.client.on("ready", () => {
//       console.log("Redis ready...");
//       this.client.on("connect", () => {
//         console.log("Redis connection established");
//       });
//     });

//     this.client.on("error", (error) => {
//       console.log("Redis error: ", error);
//     });
//   }

//   async set(key: string, value: string, ttl?: number) {
//     await this.client.set(key, value);

//     if (ttl) {
//       await this.client.expire(key, ttl);
//     }
//   }

//   async get(key: string) {
//     const result = await this.client.get(key);
//     return result;
//   }

//   async del(key: string) {
//     const delKey = `INVENTORY:${key}`;
//     await this.client.multi().del(delKey).exec();
//   }

//   async setService(key: string, data: any) {
//     for (let [k, v] of Object.entries(data)) {
//       await this.client.multi().hset(Services(key, data.id), k, JSON.stringify(v)).exec();
//     }

//     return true;
//   }

//   async getService(key: string) {
//     await this.client.watch(`INVENTORY:${key}`);
//     const cacheData = await this.client.multi().hgetall(`INVENTORY:${key}`).exec();

//     let result = {} as any;
//     for (let [k, v] of Object.entries(cacheData[0][1])) {
//       result[k] = JSON.parse(v as string);
//     }

//     return result;
//   }

//   async updateService(key: string, data: any) {
//     await this.del(key);

//     await this.setService("INVENTORY", data);
//   }
// }


import { createClient } from "redis";
import { Service } from "typedi";
const Services = (service: string, key: string) => `${service}:${key}`;

@Service()
export class RedisService {
  private client: any;
  constructor() {
    this.bindListeners();
  }

  async bindListeners() {
    this.client = createClient({ url: "redis://127.0.0.1:6371" });
    await this.client.connect();
  }

  async del(key: string) {
    const delKey = `INVENTORY:${key}`;
    await this.client.multi().del(delKey).exec();
  }

  async setService(key: string, data: any) {
    if(data.id) {
      for (let [k, v] of Object.entries(data)) {
        await this.client
          .multi()
          .HSET(Services(key, data.id), k, JSON.stringify(v))
          .exec();
      }
  
      return true;
    }
  }

  async getService(key: string) {
    await this.client.watch(`INVENTORY:${key}`);
    const cacheData = await this.client
      .multi()
      .HGETALL(`INVENTORY:${key}`)
      .exec();

    let result = {} as any;
    for (let [k, v] of Object.entries(cacheData[0])) {
      result[k] = JSON.parse(v as string);
    }

    return result;
  }

  async updateService(key: string, data: any) {
    await this.del(key);

    await this.setService("INVENTORY", data);
  }
}
