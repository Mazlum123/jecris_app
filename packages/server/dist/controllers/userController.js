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
