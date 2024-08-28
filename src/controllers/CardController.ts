import { Request, Response } from "express";
import { RoomCard } from "../db/entities/RoomCard";
import { LogErrors } from "../decorators/LogErrors";
import { CardService } from "../services/CardService";

export class CardController {
  private readonly cardService: CardService;

  constructor() {
    this.cardService = new CardService();
  }

  @LogErrors(true)
  public async getCard(req: Request, res: Response): Promise<any> {
    const roomId = parseInt(req.params.roomId);
    const cardPosition = parseInt(req.params.cardPosition);
    const card = await this.cardService.getCard(roomId, cardPosition);
    if (!card) {
      throw new Error(
        `Card with position ${cardPosition} not found in room with id ${roomId}`
      );
    }
    return res.json(card);
  }
}
