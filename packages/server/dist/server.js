import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import readRoutes from "./routes/readRoutes.js";
import userBooksRoutes from "./routes/userBooksRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
dotenv.config();
console.log("🔍 CLIENT_URL:", process.env.CLIENT_URL);
console.log("🔍 STRIPE_WEBHOOK_SECRET:", process.env.STRIPE_WEBHOOK_SECRET ? "Loaded" : "Not Loaded");
const app = express();
app.use(cors());
// 🚨 1️⃣ Webhook Stripe → `express.raw()` AVANT `express.json()`
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
// 🚨 2️⃣ Middleware JSON pour toutes les autres routes
app.use(express.json());
// ✅ Routes API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/read", readRoutes);
app.use("/api/user-books", userBooksRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/cart", cartRoutes);
// ✅ Middleware de gestion des erreurs
app.use(errorHandler);
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
export { app, server };
