import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import readRoutes from "./routes/readRoutes.js";
import userBooksRoutes from "./routes/userBooksRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
dotenv.config();
console.log("🔍 CLIENT_URL:", process.env.CLIENT_URL);
console.log("🔍 DATABASE_URL:", process.env.DATABASE_URL ? "Loaded" : "Not Loaded");
console.log("🔍 STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Loaded" : "Not Loaded");
console.log("🔍 STRIPE_WEBHOOK_SECRET:", process.env.STRIPE_WEBHOOK_SECRET ? "Loaded" : "Not Loaded");
const app = express();
app.use(cors());
app.post("/api/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/read", readRoutes);
app.use("/api/user-books", userBooksRoutes);
app.use("/api/payment", paymentRoutes);
app.use(errorHandler);
// Route de test
app.get("/", (req, res) => {
    res.json({ message: "L'API fonctionne !" });
});
const PORT = process.env.NODE_ENV === "test" ? 0 : process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    const address = server.address();
    if (typeof address === "string" || address === null) {
        console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
    }
    else {
        console.log(`✅ Serveur lancé sur http://localhost:${address.port}`);
    }
});
server.on("close", () => {
    console.log("🚀 Serveur fermé proprement.");
});
export { app, server };
