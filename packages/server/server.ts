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

const PORT = process.env.PORT || 4000; // ✅ Port dynamique
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"; // ✅ URL dynamique

console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
console.log(`🔗 Client URL : ${CLIENT_URL}`);

const app = express();
app.use(cors({ origin: CLIENT_URL })); // ✅ Accepter seulement l’URL définie
app.use(express.json());

// ✅ Webhook Stripe doit utiliser `express.raw()`
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

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

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});

export { app, server };