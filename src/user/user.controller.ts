import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { UserService } from "@src/user/user.service";

@injectable()
export class UserController {
  constructor(private readonly userService: UserService) {}

  async createNonTransactional(req: Request, res: Response) {
    const { name, email, bio } = req.body;

    try {
      const result = await this.userService.createUserWithProfileNonTransactional({
        name,
        email,
        bio,
      });
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send({
        error: error.message,
        userCreated: error.userCreated,
      });
    }
  }

  async createTransactional(req: Request, res: Response) {
    const { name, email, bio } = req.body;

    try {
      const result = await this.userService.createUserWithProfileTransactional({
        name,
        email,
        bio,
      });
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send({
        error: error.message,
        userCreated: error.userCreated,
      });
    }
  }
}
