import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// Route de test
app.get("/", (req, res) => {
    res.json({ message: "L'API fonctionne !" });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
