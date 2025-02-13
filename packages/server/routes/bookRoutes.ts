import { Router } from "express";
import { getAllBooks, addBook } from "../controllers/bookController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { verifyBookOwnership } from "../middlewares/authMiddleware.js";
import { getBookPage } from "../controllers/readControllers.js";

const router = Router();

router.get("/", getAllBooks);
router.post("/", addBook);
router.get("/read/:bookId/:pageNumber", authenticateToken, verifyBookOwnership, getBookPage);

export default router;