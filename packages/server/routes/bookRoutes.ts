import { Router } from "express";
import { getAllBooks, addBook } from "../controllers/bookController.js";

const router = Router();

router.get("/", getAllBooks);
router.post("/", addBook);
router.get("/read/:bookId/:pageNumber", authenticateToken, verifyBookOwnership, readBook);

export default router;