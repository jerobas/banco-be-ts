import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();
const userController = new UserController();

router.get("/", (req, res) => userController.getAllUsers(req, res));
router.get("/me", (req, res) => userController.checkUser(req, res));
router.get("/:id", (req, res) => userController.getUserById(req, res));
router.post("/", (req, res) => userController.createUser(req, res));

export default router;
