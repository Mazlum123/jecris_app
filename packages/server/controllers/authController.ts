import { Request, Response } from "express";
import { db } from "../config/db.js";
import { users } from "../models/userModel.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
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

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        // ✅ Ajout du username dans la réponse
        res.status(200).json({ message: "Connexion réussie !", token, username: user.email });

    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ error: "Erreur lors de la connexion." });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.insert(users).values({ email, password: hashedPassword }).returning();

        res.status(201).json({ message: "Utilisateur créé avec succès !", user: newUser });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'inscription." });
    }
};

export const checkEmail = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Vérification si l'email est fourni
      if (!email) {
        return res.status(400).json({ error: "L'email est requis." });
      }

      // Vérifier la syntaxe de l'email
      const isValidSyntax = validator.isEmail(email);

      if (!isValidSyntax) {
        return res.status(400).json({ error: "L'email n'est pas valide." });
      }

      // Vérification si l'email est déjà utilisé
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

      const isAvailable = existingUser.length === 0;

      // Réponse complète
      return res.status(200).json({
        exists: true, // Ici, on pourrait implémenter un service de vérification d'email si nécessaire
        available: isAvailable,
      });
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email :", error);
      res.status(500).json({ error: "Erreur serveur lors de la vérification de l'email." });
    }
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "Déconnexion réussie !" });
};