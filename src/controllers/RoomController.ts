import { Request, Response } from "express";
import { Room } from "../db/entities/Room";
import { LogErrors } from "../decorators/LogErrors";
import { roomHandler } from "../handlers/RoomsHandler";
import { RoomService } from "../services/RoomService";
import { UserService } from "../services/UserService";

export class RoomController {
  private readonly roomService: RoomService;
  private readonly userService: UserService;
  private readonly roomsHandler: any;

  constructor() {
    this.roomService = new RoomService();
    this.userService = new UserService();
    this.roomsHandler = roomHandler;
  }

  @LogErrors(true)
  public async createRoom(req: Request, res: Response): Promise<any> {
    const { name, password } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Bad request. Please enter a name for the room" });
    }

    const client = await this.userService.getUserByIp(req.userIp);

    if (!client)
      return res.status(404).json({ message: "You need to add name first" });
    const room = await this.roomService.createRoom(name, password, client);
    req.user_socket.join(room.id.toString());
    this.roomsHandler.getRooms();
    return res.status(201).json({ message: "Room created successfully", room });
  }

  @LogErrors(true)
  public async leaveRoom(req: Request, res: Response): Promise<any> {
    const { roomId } = req.body;

    const client = await this.userService.getUserByIp(req.userIp);

    if (!client) return res.status(404).json({ message: "User not found" });

    await this.roomService.removeOwnerAndHandleRoom(roomId, req.userIp);

    // reset user for next room
    await this.userService.updateUserFields(client.id, {
      money: 500.0,
      position: 0,
      numberOfEqualDices: 0,
      player_state: true,
    });

    this.roomsHandler.getRooms();
    return res.json({ message: "You left the room successfully" });
  }

  @LogErrors(true)
  public async joinRoom(req: Request, res: Response): Promise<any> {
    const { id, password } = req.body;
    const client = await this.userService.getUserByIp(req.userIp);
    if (!client) return res.status(404).json({ message: "And your name is?" });
    let room = await this.roomService.addUserToRoom(
      id,
      password,
      client,
      req.user_socket
    );
    req.user_socket.join(room.id.toString());
    await this.roomsHandler.getRooms();
    return;
  }

  @LogErrors(true)
  public async getAllRooms(req: Request, res: Response): Promise<Room[] | any> {
    const rooms = await this.roomService.getAllRooms();
    return res.json(rooms);
  }
}
