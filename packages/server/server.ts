import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import bodyParser from 'body-parser';
import passport from "passport";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import readRoutes from "./routes/readRoutes.js";
import userBooksRoutes from "./routes/userBooksRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { handleWebhook } from './controllers/paymentController.js';
import cartRoutes from "./routes/cartRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import "./config/passport.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "https://jecris.netlify.app";
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

console.log(`🚀 Serveur lancé sur ${SERVER_URL}`);
console.log(`🔗 Client URL : ${CLIENT_URL}`);

const app = express();

// ✅ Stripe webhook - Doit rester avant express.json()
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// ✅ Middleware global
app.use(express.json());
app.use(passport.initialize());

// ✅ Gestion CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [CLIENT_URL, `http://localhost:5173`];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS bloqué pour l'origine : ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.options('*', cors());

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

// ✅ Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur ${SERVER_URL}`);
  console.log(`🔗 Client URL : ${CLIENT_URL}`);
});

export { app, server };