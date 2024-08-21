import { Router } from "express";
import userRoutes from "./userRoutes";
import roomRoutes from "./roomRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/rooms", roomRoutes);

export default router;
