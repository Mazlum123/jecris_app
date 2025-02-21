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

        // Validation des paramètres
        if (isNaN(bookId) || isNaN(pageNumber)) {
            res.status(400).json({
                status: 'error',
                message: "ID du livre ou numéro de page invalide.",
                data: null
            });
            return;
        }

        const book = await db.select().from(books).where(eq(books.id, bookId));

        if (!book.length) {
            res.status(404).json({
                status: 'error',
                message: "Livre non trouvé.",
                data: null
            });
            return;
        }

        const content = book[0].content;
        const start = (pageNumber - 1) * CHARACTERS_PER_PAGE;
        const end = start + CHARACTERS_PER_PAGE;
        const pageContent = content.slice(start, end);
        const totalPages = Math.ceil(content.length / CHARACTERS_PER_PAGE);

        if (!pageContent.length) {
            res.status(404).json({
                status: 'error',
                message: "Page non trouvée.",
                data: null
            });
            return;
        }

        const responseData = {
            bookId: book[0].id,
            title: book[0].title,
            pageNumber,
            totalPages,
            content: pageContent,
            hasNextPage: pageNumber < totalPages,
            hasPreviousPage: pageNumber > 1
        };

        res.status(200).json({
            status: 'success',
            message: "Page récupérée avec succès",
            data: responseData,
            // Pour compatibilité
            bookId: book[0].id,
            title: book[0].title,
            pageNumber,
            totalPages,
            content: pageContent
        });

    } catch (error) {
        console.error("🚨 Erreur récupération page :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors du chargement de la page.",
            data: null
        });
    }
};

export const saveReadingProgress: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { bookId, lastPageRead } = req.body;
        const userId = req.user?.id;

        // Validation des paramètres
        if (!userId) {
            res.status(401).json({
                status: 'error',
                message: "Utilisateur non authentifié.",
                data: null
            });
            return;
        }

        if (!bookId || !lastPageRead || isNaN(lastPageRead)) {
            res.status(400).json({
                status: 'error',
                message: "ID du livre et numéro de page requis.",
                data: null
            });
            return;
        }

        const userBook = await db
            .select()
            .from(userBooks)
            .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)));

        if (!userBook.length) {
            res.status(403).json({
                status: 'error',
                message: "Vous ne possédez pas ce livre.",
                data: null
            });
            return;
        }

        const updatedProgress = await db
            .update(userBooks)
            .set({ lastPageRead })
            .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)))
            .returning();

        res.status(200).json({
            status: 'success',
            message: "Progression sauvegardée avec succès.",
            data: {
                bookId,
                lastPageRead,
                updatedAt: new Date().toISOString()
            },
            // Pour compatibilité
            progress: updatedProgress[0]
        });
        
    } catch (error) {
        console.error("🚨 Erreur lors de la sauvegarde :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de la sauvegarde de la progression.",
            data: null
        });
    }
};