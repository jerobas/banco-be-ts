import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { LogErrors } from "../decorators/LogErrors";

export class UserController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }
  // @LogErrors(true)
  // public async login(req: Request, res: Response): Promise<any> {
  //   const { username, password } = req.body;

  //   const user = await this.userService.getUserByName(username);

  //   if (!user) {
  //     return res.status(401).json({ message: "Invalid credentials" });
  //   }
  //   const match = await bcrypt.compare(password, user.password);

  //   if (!match) {
  //     return res.status(401).json({ message: "Invalid credentials" });
  //   }

  //   const token = jwt.sign({ id: user?.id }, process.env.JWT_SECRET as string, {
  //     expiresIn: process.env.expiresIn,
  //   });

  //   res.json({ token, expiresIn: process.env.expiresIn });
  // }
  @LogErrors(true)
  public async getAllUsers(req: Request, res: Response): Promise<any> {
    const users = await this.userService.getAllUsers();
    res.status(200).json(users);
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

    const newUser = await this.userService.createUser(
      name,
      req.user_socket.id,
      req.userIp
    );
    
    res.status(201).json(newUser);
  }
}
