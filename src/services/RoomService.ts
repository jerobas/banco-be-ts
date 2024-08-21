import { AppDataSource } from "../db/ormconfig";
import { Card } from "../db/entities/Card";
import { Repository } from "typeorm";
import { Room } from "../db/entities/Room";
import { ChatMessage } from "../db/entities/ChatMessage";
import { RoomCard } from "../db/entities/RoomCard";
import { Socket } from "socket.io";
import { User } from "../db/entities/User";

export class RoomService {
  private roomRepository: Repository<Room>;
  private cardRepository: Repository<Card>;
  private userRepository: Repository<User>;
  private roomCardRepository: Repository<RoomCard>;
  private chatMessageRepository: Repository<ChatMessage>;

  constructor() {
    this.roomRepository = AppDataSource.getRepository(Room);
    this.cardRepository = AppDataSource.getRepository(Card);
    this.roomCardRepository = AppDataSource.getRepository(RoomCard);
    this.userRepository = AppDataSource.getRepository(User);
    this.chatMessageRepository = AppDataSource.getRepository(ChatMessage);
  }

  private async initializeRoomWithCards(roomId: number) {
    const room = await this.roomRepository.findOneBy({ id: roomId });
    if (!room) {
      throw new Error(`Room with id ${roomId} not found.`);
    }

    const cards = await this.cardRepository.find();
    const roomCards = cards.map((card) => {
      const roomCard = new RoomCard();
      roomCard.room = room;
      roomCard.card = card;
      roomCard.owner = "game";
      roomCard.on = false;
      roomCard.quantity = card.quantity;
      return roomCard;
    });
    await this.roomCardRepository.save(roomCards);
    return;
  }

  private async changeRoomState(roomId: number) {}

  public async updateCardOwner(
    roomId: number,
    userId: number,
    userIp: string,
    cardId: number
  ) {}

  private async deleteByOwnerIp(owner_ip: string) {
    const room = await this.roomRepository.findOne({
      where: { owner_ip: owner_ip },
    });
    if (room) {
      await this.roomRepository.softDelete(room.id);
    }
    return;
  }

  public async getRoomByName(name: string) {
    const room = await this.roomRepository.findOne({
      where: { name: name },
      relations: ["users"],
    });
    return room;
  }

  public async getRoomById(id: number): Promise<Room | null> {
    const room = await this.roomRepository.findOne({
      where: { id: id },
      relations: ["users", "current_user_turn"],
    });
    return room;
  }

  public async updateRoom(roomId: number, updateData: Partial<Room>) {
    let room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ["users"],
    });

    if (!room) {
      throw new Error(`Room with id ${roomId} not found.`);
    }

    room = Object.assign(room, updateData);

    await this.roomRepository.save(room);

    return room;
  }

  public async saveChatMessage(
    roomId: number,
    userIp: string,
    message: string
  ) {
    const room = await this.roomRepository.findOneBy({ id: roomId });

    if (!room) {
      throw new Error(`Room with id ${roomId} not found.`);
    }

    const user = await this.userRepository.findOneBy({ ip_address: userIp });

    if (!user) {
      throw new Error(`User with ip ${userIp} not found.`);
    }

    const chatMessage = new ChatMessage();
    chatMessage.room = room;
    chatMessage.user = user;
    chatMessage.user_ip_address = userIp;
    chatMessage.message = message;

    await this.chatMessageRepository.save(chatMessage);

    return chatMessage;
  }

  public async createRoom(name: string, password: string, user: User) {
    await this.deleteByOwnerIp(user.ip_address);
    let room = await this.roomRepository.save({
      name: name,
      password: password,
      owner_ip: user.ip_address,
    });

    if (!room) {
      throw new Error("Failed to create room.");
    }
    room.users = [user];
    await this.roomRepository.save(room);
    return room;
  }

  public async getAllRooms() {
    const rooms = await this.roomRepository.find({ relations: ["users"] });
    return rooms;
  }

  public async addUserToRoom(
    id: number,
    password: string,
    user: User,
    socket: Socket
  ) {
    let room = await this.roomRepository.findOne({
      where: { id: id },
      relations: ["users"],
    });

    if (!room) {
      throw new Error(`Room not found.`);
    }

    if (room.password && room.password != password) {
      throw new Error(`Incorrect password.`);
    }

    if (room.users.length >= 4) {
      throw new Error(`Room is full.`);
    }

    if (room.users.includes(user)) {
      throw new Error(`User ${user.name} is already in this room.`);
    }

    room.users.push(user);
    await this.roomRepository.save(room);
    return room;
  }

  public async removeUserFromRoom(
    roomId: number,
    userIp: string,
    socket: Socket
  ) {
    let room = await this.roomRepository.findOneBy({ id: roomId });
    let user = await this.userRepository.findOneBy({ ip_address: userIp });

    if (!room) {
      throw new Error(`Room with id ${roomId} not found.`);
    }
    if (user && !room.users.includes(user)) {
      throw new Error(`User with ip ${userIp} not found in room ${roomId}.`);
    }

    room.users = room.users.filter((u) => u.id !== user?.id);
    await this.roomRepository.save(room);
    return room;
  }
}