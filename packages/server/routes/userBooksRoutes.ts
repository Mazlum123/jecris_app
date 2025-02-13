import { Router } from "express";
import { addBookToLibrary, getUserBooks, removeBookFromLibrary } from "../controllers/userBooksControllers.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authenticateToken, addBookToLibrary);
router.get("/", authenticateToken, getUserBooks);
router.delete("/", authenticateToken, removeBookFromLibrary);

export default router;
