import { Router } from "express";
import { getUserBooks, addBookToLibrary } from "../controllers/userBooksControllers.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authenticateToken, addBookToLibrary);
router.get("/", authenticateToken, getUserBooks);

export default router;
