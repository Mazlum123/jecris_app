import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Ça informe TypeScript que user sera une propriété possible sur Request.
declare module "express" {
    interface Request {
        user?: { id: number; email: string };
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