import { Router } from "express";
import { getBookPage, saveReadingProgress } from "../controllers/readControllers.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
const router = Router();
router.get("/:bookId/:pageNumber", authenticateToken, getBookPage);
router.post("/save-progress", authenticateToken, saveReadingProgress);
export default router;
