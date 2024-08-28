import { Router } from "express";
import userRoutes from "./userRoutes";
import roomRoutes from "./roomRoutes";
import cardRoutes from "./cardsRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/rooms", roomRoutes);
router.use("/cards", cardRoutes);

export default router;
