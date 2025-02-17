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
const CLIENT_URL = process.env.CLIENT_URL || "https://jecris.netlify.app";

console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
console.log(`🔗 Client URL : ${CLIENT_URL}`);

const app = express();

// ✅ CORS : Acceptation multiple (Netlify + Railway + Localhost)
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173"];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

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
