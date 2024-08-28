import { Router } from "express";
import { CardController } from "../controllers/CardController";

const router = Router();
const cardController = new CardController();

router.get("/room/:roomId/cards/:cardPosition", (req, res) =>
  cardController.getCard(req, res)
);

export default router;
