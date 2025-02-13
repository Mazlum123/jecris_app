import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
            };
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

export const verifyBookOwnership = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { bookId } = req.params;

    if (!userId) {
        return res.status(401).json({ error: "Non authentifié." });
    }

    const bookOwned = await db.select().from(userBooks).where(
        eq(userBooks.userId, userId),
        eq(userBooks.bookId, parseInt(bookId))
    );

    if (!bookOwned.length) {
        return res.status(403).json({ error: "Vous n'avez pas acheté ce livre." });
    }

    next();
};
