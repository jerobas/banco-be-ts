import { Router } from "express";
import { RoomController } from "../controllers/RoomController";

const router = Router();
const roomController = new RoomController();

router.post("/", (req, res) => roomController.createRoom(req, res));
router.post("/join", (req, res) => roomController.joinRoom(req, res));

router.post("/leave", (req, res) => roomController.leaveRoom(req, res));

router.get("/", (req, res) => roomController.getAllRooms(req, res));

export default router;
