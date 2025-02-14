import { Router } from "express";
import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { createPayment, handleWebhook } from "../controllers/paymentController.js";
const router = Router();
router.post("/", authenticateToken, createPayment);
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);
export default router;
