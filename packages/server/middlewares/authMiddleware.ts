import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { userBooks } from "../models/userBooksModel.js";
import { and, eq } from "drizzle-orm";

declare global {
    namespace Express {
      interface User {
        id: number;
        email: string;
      }
    }
  }

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "Accès refusé. Token manquant." });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; email: string };
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: "Token invalide." });
    }
};

export const verifyBookOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { bookId } = req.params;

        if (!userId) {
            res.status(401).json({ error: "Non authentifié." });
            return;
        }

        const bookOwned = await db.select().from(userBooks).where(
            and(eq(userBooks.userId, userId), eq(userBooks.bookId, parseInt(bookId!)))
        );

        if (!bookOwned.length) {
            res.status(403).json({ error: "Vous n'avez pas acheté ce livre." });
            return;
        }

        return next();
    } catch (error) {
        console.error("Erreur middleware `verifyBookOwnership` :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};
