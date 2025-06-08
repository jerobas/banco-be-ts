import { AppDataSource } from "../db/ormconfig";
import { Repository } from "typeorm";
import { RoomCard } from "../db/entities/RoomCard";
import { User } from "../db/entities/User";

export class CardService {
  private roomCardRepository: Repository<RoomCard>;
  private userRepository: Repository<User>;

  constructor() {
    this.roomCardRepository = AppDataSource.getRepository(RoomCard);
    this.userRepository = AppDataSource.getRepository(User);
  }

  public async getCard(roomId: number, card_position: number) {
    const roomCard = await this.roomCardRepository.findOne({
      where: {
        room: {
          id: roomId,
        },
        position: card_position,
      },
      relations: ["card", "room"],
    });

    return roomCard;
  }

  public async buyCard(roomId: number, user: User) {
    const roomCard = await this.roomCardRepository.findOne({
      where: {
        room: {
          id: roomId,
        },
        position: user.position,
      },
      relations: ["room", "card", "owner"],
    });

    if (!roomCard) {
      throw new Error("Card not found in this room at the given position.");
    }
    
    roomCard.owner = user;
    await this.roomCardRepository.save(roomCard);
    user.money -= roomCard.card.purchase_value;
    return await this.userRepository.save(user);
  }
}
