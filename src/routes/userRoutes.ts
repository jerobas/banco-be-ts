import { Router } from "express";
import { UserController } from "../controllers/UserController";
import authMiddleware from "../middleware/authorization";

const router = Router();
const userController = new UserController();

router.get("/", (req, res) => userController.getAllUsers(req, res));
// router.get("/:id", authMiddleware, (req, res) =>
//   userController.getUserById(req, res)
// );
router.post("/", (req, res) => userController.createUser(req, res));

// router.post("/login", (req, res) => userController.login(req, res));

export default router;
