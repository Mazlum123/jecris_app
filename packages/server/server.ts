import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import readRoutes from "./routes/readRoutes.js";
import userBooksRoutes from "./routes/userBooksRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import "./config/passport.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "https://jecris.netlify.app";
const SERVER_URL = process.env.SERVER_URL || "https://jecrisapp-production.up.railway.app";

console.log(`🚀 Serveur lancé sur ${SERVER_URL || `http://localhost:${PORT}`}`);
console.log(`🔗 Client URL : ${CLIENT_URL}`);

const app = express();

app.use(express.json());
app.use(passport.initialize()); // Initialisation de Passport

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [CLIENT_URL];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/read", readRoutes);
app.use("/api/user-books", userBooksRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/cart", cartRoutes);

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur ${SERVER_URL}`);
  console.log(`🔗 Client URL : ${CLIENT_URL}`);
});

export { app, server };
