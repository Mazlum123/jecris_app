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
import { handleWebhook } from "./controllers/paymentController.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";

dotenv.config();

console.log("🔍 CLIENT_URL:", process.env.CLIENT_URL);
console.log("🔍 STRIPE_WEBHOOK_SECRET:", process.env.STRIPE_WEBHOOK_SECRET ? "Loaded" : "Not Loaded");

const app = express();
app.use(cors());


app.post("/api/payment/webhook", express.raw({ type: "application/json" }), handleWebhook);

app.use(express.json());

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/read", readRoutes);
app.use("/api/user-books", userBooksRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/cart", cartRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});

export { app, server };
