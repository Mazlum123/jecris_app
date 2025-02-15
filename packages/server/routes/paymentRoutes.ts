import { Router, Request, Response } from "express";
import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { createPayment, handleWebhook, paymentSuccess, paymentCancel } from "../controllers/paymentController.js";

const router = Router();

// ✅ Route de paiement protégée par authentification
router.post("/", authenticateToken, createPayment);

// ✅ Webhook Stripe (pas d'authentification car c'est Stripe qui l'appelle)
router.post("/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    await handleWebhook(req, res);
});

// ✅ Routes pour redirection après paiement
router.get("/success", paymentSuccess);
router.get("/cancel", paymentCancel);

export default router;
