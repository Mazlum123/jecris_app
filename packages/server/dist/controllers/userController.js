import { db } from "../config/db.js";
import { users } from "../models/userModel.js";
export const getUsers = async (req, res) => {
    try {
        const allUsers = await db.select().from(users).execute();
        res.status(200).json(allUsers);
    }
    catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
    }
};
export const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Utilisateur non authentifié" });
            return;
        }
        res.status(200).json(req.user);
    }
    catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur." });
    }
};
