import { UserService } from "./../service/user.service";
import { Router } from "express";
import { CreateUserDto } from "./create-user.dto";
import { parseReqMiddleware } from "../middleware/parse.middleware";
export function UserController(userService: UserService) {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const result = await userService.listUser();

      res.json(result);
    } catch (error) {
      next(error);
    }
  });
  router.post("/", async (req, res, next) => {
    try {
      const payload = req.body as CreateUserDto;
      const result = await userService.createUser(payload);

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.use(parseReqMiddleware);

  router.get("/:id", async (req, res, next) => {
    try {
      const id = req["id"];
      const result = await userService.getUser(id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/", async (req, res, next) => {
    try {
      const id = req["id"];
      const payload = req.body;
      const result = await userService.updateUser(id, payload);

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
