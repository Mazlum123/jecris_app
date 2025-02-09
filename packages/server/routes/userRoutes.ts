import { Router } from "express";
import { getMe, getUsers } from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticateToken, getUsers);
router.get("/me", authenticateToken, getMe);

export default router;
