import { User } from "../db/entities/User";
import { AppDataSource } from "../db/ormconfig";
import { Repository } from "typeorm";

export class UserService {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  private handleUserNotFound(entity: string, value: string | number): never {
    throw new Error(`${entity} with value ${value} not found.`);
  }

  public async updateUserFields(
    userId: number,
    fieldsToUpdate: Partial<User>
  ): Promise<User> {
    const user = await this.repository.findOneBy({ id: userId });
    if (!user) {
      this.handleUserNotFound("User", userId);
    }

    Object.assign(user, fieldsToUpdate);

    const updatedUser = await this.repository.save(user);

    return updatedUser;
  }

  public async getUserByIp(userIp: string): Promise<User | null> {
    return await this.repository.findOneBy({ ip_address: userIp });
  }

  public async getAllUsers(): Promise<User[]> {
    return await this.repository.find();
  }

  public async getUserById(id: number): Promise<User | undefined> {
    const user = await this.repository.findOneBy({ id: id });
    if (!user) {
      this.handleUserNotFound("User", id);
    }
    return user;
  }

  public async updateSocketId(userId: number, socketId: string): Promise<void> {
    await this.repository.update({ id: userId }, { socket_id: socketId });
  }

  public async createUser(
    name: string,
    socket_id: string,
    userIp: string
  ): Promise<User> {
    let createdUser = await this.repository.findOneBy({ ip_address: userIp });
    if (createdUser) {
      throw new Error(`User with userIp ${userIp} already exists.`);
    }

    createdUser = await this.repository.save({
      name,
      socket_id,
      ip_address: userIp,
    });

    if (!createdUser) {
      throw new Error("Failed to create user");
    }

    return createdUser;
  }
}
