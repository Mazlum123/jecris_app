import { db } from "../config/db.js";
import { users } from "../models/userModel.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        if (existingUser.length === 0) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }
        const user = existingUser[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Connexion réussie !", token });
    }
    catch (error) {
        res.status(500).json({ error: "Erreur lors de la connexion." });
    }
};
export const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.insert(users).values({ email, password: hashedPassword }).returning();
        res.status(201).json({ message: "Utilisateur créé avec succès !", user: newUser });
    }
    catch (error) {
        res.status(500).json({ error: "Erreur lors de l'inscription." });
    }
};
