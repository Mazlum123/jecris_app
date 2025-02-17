import { Router } from "express";
import { getAllBooks, getBookById, addBook, createBook, updateBook, deleteBook } from "../controllers/bookController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { verifyBookOwnership } from "../middlewares/authMiddleware.js";
import { getBookPage } from "../controllers/readControllers.js";

const router = Router();

router.get("/", getAllBooks);
router.get("/:bookId", getBookById);
router.post("/", createBook);
router.patch("/:bookId", authenticateToken, updateBook);
router.delete("/:bookId", authenticateToken, deleteBook);
router.get("/read/:bookId/:pageNumber", authenticateToken, verifyBookOwnership, getBookPage);

export default router;