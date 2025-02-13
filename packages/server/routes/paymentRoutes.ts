import { Router } from "express";
import { Express } from "express";
import { createPayment, handleWebhook } from "../controllers/paymentController.js";

const router = Router();

router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);
router.post("/", createPayment);

export default router;