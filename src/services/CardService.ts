import { AppDataSource } from "../db/ormconfig";
import { Repository } from "typeorm";
import { RoomCard } from "../db/entities/RoomCard";

export class CardService {
  private roomCardRepository: Repository<RoomCard>;

  constructor() {
    this.roomCardRepository = AppDataSource.getRepository(RoomCard);
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
}
