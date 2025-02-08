import { db } from "../config/db.js";
import { users } from "../models/userModel.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
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
