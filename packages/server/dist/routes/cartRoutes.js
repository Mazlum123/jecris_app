import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { addToCart, getCart, removeFromCart, clearCart } from "../controllers/cartController.js";
const router = express.Router();
router.post("/", authenticateToken, addToCart); // Ajouter au panier
router.get("/", authenticateToken, getCart); // Voir le panier
router.delete("/", authenticateToken, removeFromCart); // Supprimer un livre du panier
router.delete("/clear", authenticateToken, clearCart); // Vider tout le panier
export default router;
