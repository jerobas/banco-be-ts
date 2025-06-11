import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { UserService } from "../services/UserService";
import { LogErrors } from "../decorators/LogErrors";

export class UserController {
  private readonly userService: UserService;
  private readonly cookie_name: string;

  constructor() {
    this.userService = new UserService();
    this.cookie_name = process.env.COOKIE_NAME || "lopoly-token";
  }
  @LogErrors(true)
  public async getAllUsers(req: Request, res: Response): Promise<any> {
    const users = await this.userService.getAllUsers();
    res.status(200).json(users);
  }
  @LogErrors(true)
  public async checkUser(req: Request, res: Response) {
    const userToken = req.cookies[this.cookie_name];

    if (!userToken) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await this.userService.getUserByToken(userToken);

    if (!user) {
      return res.status(401).json({ message: "Invalid session" });
    }

    res.status(200).json(user);
  }
  @LogErrors(true)
  public async getUserById(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id, 10);
    const user = await this.userService.getUserById(userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  }
  @LogErrors(true)
  public async createUser(req: Request, res: Response): Promise<void> {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }

    const userToken = uuidv4();

    const newUser = await this.userService.createUser(
      name,
      req.user_socket.id,
      req.userIp,
      userToken
    );

    res
      .cookie(this.cookie_name, userToken, {
        // httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
      })
      .status(201)
      .json(newUser);
  }
}
