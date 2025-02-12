import { Request, Response, RequestHandler } from "express";
import { db } from "../config/db.js";
import { userBooks } from "../models/userBooksModel.js";
import { books } from "../models/bookModel.js";
import { and, eq } from "drizzle-orm";

export const addBookToLibrary = async (req: Request, res: Response) => {
    try {
        const { bookId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: "Utilisateur non authentifié." });
            return;
        }

        const book = await db.select().from(books).where(eq(books.id, parseInt(bookId)));

        if (!book.length) {
            res.status(404).json({ error: "Livre non trouvé dans la bibliothèque publique." });
            return;
        }

        const existingEntry = await db.select().from(userBooks).where(
            and(
                eq(userBooks.userId, userId),
                eq(userBooks.bookId, parseInt(bookId))
            )
        );

        if (existingEntry.length) {
            res.status(400).json({ error: "Ce livre est déjà dans votre bibliothèque personnelle." });
            return;
        }

        await db.insert(userBooks).values({
            userId,
            bookId: parseInt(bookId),
        });

        res.status(201).json({ message: "Livre ajouté à votre bibliothèque personnelle avec succès." });

    } catch (error) {
        console.error("🚨 Erreur lors de l'ajout du livre :", error);
        res.status(500).json({ error: "Erreur lors de l'ajout du livre." });
    }
};

export const getUserBooks: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: "Utilisateur non authentifié." });
            return;
        }

        const ownedBooks = await db
            .select({ id: books.id, title: books.title, description: books.description, price: books.price })
            .from(userBooks)
            .innerJoin(books, eq(userBooks.bookId, books.id))
            .where(eq(userBooks.userId, userId));

        res.status(200).json(ownedBooks);
        return;
    } catch (error) {
        console.error("🚨 Erreur récupération des livres possédés :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des livres possédés." });
        return;
    }
};