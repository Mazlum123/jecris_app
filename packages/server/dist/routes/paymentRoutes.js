import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { createPayment, handleWebhook, paymentSuccess, paymentCancel } from "../controllers/paymentController.js";
const router = Router();
// ✅ Route de paiement protégée par authentification
router.post("/session", authenticateToken, createPayment);
// ✅ Webhook Stripe doit recevoir un raw body
router.post("/webhook", handleWebhook);
// ✅ Routes pour redirection après paiement
router.get("/success", paymentSuccess);
router.get("/cancel", paymentCancel);
export default router;
