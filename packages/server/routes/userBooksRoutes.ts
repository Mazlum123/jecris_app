import { Router } from "express";
import { addBookToLibrary, getUserBooks, removeBookFromLibrary } from "../controllers/userBooksControllers.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { addFreeBookToPersonalLibrary } from "../controllers/userBooksControllers.js";

const router = Router();

router.post("/", authenticateToken, addBookToLibrary);
router.get("/", authenticateToken, getUserBooks);
router.delete("/:bookId", authenticateToken, removeBookFromLibrary);
router.post("/add-free/:bookId", authenticateToken, addFreeBookToPersonalLibrary);

export default router;
