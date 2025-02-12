import { Request, Response, RequestHandler } from "express";
import { db } from "../config/db.js";
import { userBooks } from "../models/userBooksModel.js";
import { books } from "../models/bookModel.js";
import { eq, and } from "drizzle-orm";

const CHARACTERS_PER_PAGE = 1000;

export const getBookPage: RequestHandler = async (req, res): Promise<void> => {
    try {
        const bookId = parseInt(req.params.bookId);
        const pageNumber = parseInt(req.params.pageNumber);

        const book = await db.select().from(books).where(eq(books.id, bookId));

        if (!book.length) {
            res.status(404).json({ error: "Livre non trouvé." });
            return;
        }

        const content = book[0].content;
        const start = (pageNumber - 1) * CHARACTERS_PER_PAGE;
        const end = start + CHARACTERS_PER_PAGE;
        const pageContent = content.slice(start, end);

        if (!pageContent.length) {
            res.status(404).json({ error: "Page non trouvée." });
            return;
        }

        res.status(200).json({
            bookId: book[0].id,
            title: book[0].title,
            pageNumber,
            totalPages: Math.ceil(content.length / CHARACTERS_PER_PAGE),
            content: pageContent
        });
    } catch (error) {
        console.error("🚨 Erreur récupération page :", error);
        res.status(500).json({ error: "Erreur lors du chargement de la page." });
    }
};

export const saveReadingProgress: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { bookId, lastPageRead } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ error: "Utilisateur non authentifié." });
            return;
        }

        const userBook = await db.select().from(userBooks).where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)));

        if (!userBook.length) {
            res.status(403).json({ error: "Vous ne possédez pas ce livre." });
            return;
        }

        await db.update(userBooks)
            .set({ lastPageRead })
            .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)));

        res.status(200).json({ message: "Progression sauvegardée avec succès." });
    } catch (error) {
        console.error("🚨 Erreur lors de la sauvegarde :", error);
        res.status(500).json({ error: "Erreur lors de la sauvegarde de la progression." });
    }
};