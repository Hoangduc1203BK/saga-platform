import { UserService } from './../service/user.service';
import { Router } from 'express';
import { CreateUserDto } from './create-user.dto';
import { parseReqMiddleware } from '../middleware/parse.middleware';
export function UserController(userService: UserService) {
    const router = Router();

    router.post('/', async (req, res) => {
        const payload = req.body as CreateUserDto;
        const result = await userService.createUser(payload);

        return res.json(result);
    })

    router.use(parseReqMiddleware)

    router.get('/:id', async (req, res) => {
        const id = req["id"];
        const result = await userService.getUser(id);

        res.json(result);
    })

    router.patch('/',  async (req,res) => {
        const id = req["id"];
        const payload = req.body;
        const result = await userService.updateUser(id,payload);

        return res.json(result);
    })
    

    return router;

}