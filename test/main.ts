import * as express from "express";
import  axios from "axios";
import * as Queue from 'bull';
import { RedisService } from "./redis/redis";
const main = async () => {
    const app =  express();
    app.use(express.json());
    const port = 8000;

    // for(let i = 1; i<=200; i++) {
    //     const user = {
    //         name: `user${i}`,
    //         phoneNumber: '12838y391',
    //         accountBalance: 1000000,
    //         address: 'HN'
    //     }

    //     await axios.post('http://localhost:3003/user', user);
    // }
    const users = await axios.get('http://localhost:3003/user');
    const ids = users.data.map((el: any) => el.id);
    const queue = new Queue('saga', {redis: { port: 6375, host: '127.0.0.1'}});
    const redisService = new RedisService();

    await Promise.all(['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18'].map(async (id: string) => {
        await queue.add({id: id});
    }))

    queue.process(async (job) => {
        const product = await redisService.getService('1');
        const result = await redisService.get('a');

        if(product.inventory>0) {
            const doc = {
                id: 1,
                name: 'book-3',
                inventory: product.inventory - 1,
                price: 30000,
                createAt: '2022-12-21T20:30:41.283Z',
                updateAt: '2022-12-25T00:15:30.397Z'
            }

            await redisService.updateService('1', doc);
            await redisService.set('a', parseInt(result)+1);
        }
    })

    
    app.listen(port, () => {
        console.log('App listening on port ' + port);
    })
}

main().catch(err=> console.log(err));