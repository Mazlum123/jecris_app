import { Request, Response, RequestHandler } from "express";
import { db } from "../config/db.js";
import { userBooks } from "../models/userBooksModel.js";
import { books } from "../models/bookModel.js";
import { and, eq } from "drizzle-orm";

export const addBookToLibrary: RequestHandler = async (req, res) => {
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
            and(eq(userBooks.userId, userId), eq(userBooks.bookId, parseInt(bookId)))
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
    } catch (error) {
        console.error("🚨 Erreur récupération des livres possédés :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des livres possédés." });
    }
};

export const addUserBook: RequestHandler = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: "Utilisateur non authentifié." });
            return;
        }

        const bookExists = await db.select().from(books).where(eq(books.id, bookId));
        if (!bookExists.length) {
            res.status(404).json({ error: "Livre introuvable." });
            return;
        }

        const alreadyOwned = await db.select().from(userBooks).where(
            and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId))
        );

        if (alreadyOwned.length) {
            res.status(400).json({ error: "Ce livre est déjà dans votre bibliothèque." });
            return;
        }

        await db.insert(userBooks).values({
            userId,
            bookId,
        });

        res.status(201).json({ message: "Livre ajouté à votre bibliothèque !" });

    } catch (error) {
        console.error("🚨 Erreur lors de l'ajout du livre :", error);
        res.status(500).json({ error: "Erreur lors de l'ajout du livre." });
    }
};

export const removeBookFromLibrary: RequestHandler = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: "Utilisateur non authentifié." });
            return;
        }

        const existingEntry = await db.select().from(userBooks).where(
            and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId))
        );

        if (!existingEntry.length) {
            res.status(404).json({ error: "Ce livre n'est pas dans votre bibliothèque." });
            return;
        }

        await db.delete(userBooks).where(
            and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId))
        );

        res.status(200).json({ message: "Livre supprimé de votre bibliothèque avec succès." });

    } catch (error) {
        console.error("🚨 Erreur lors de la suppression du livre :", error);
        res.status(500).json({ error: "Erreur lors de la suppression du livre." });
    }
};

export const addFreeBookToPersonalLibrary: RequestHandler = async (req, res) => {
    const userId = req.user?.id;
    const { bookId } = req.params;

    if (!userId) {
        res.status(401).json({ error: "Utilisateur non authentifié." });
        return;
    }

    // ✅ Vérifie que bookId est bien une chaîne et non null/undefined
    const safeBookId: string = bookId ?? "";

    if (!safeBookId || typeof safeBookId !== "string") {
        res.status(400).json({ error: "ID de livre manquant ou invalide." });
        return;
    }

    const parsedBookId = parseInt(safeBookId, 10); // ✅ Conversion sûre

    if (isNaN(parsedBookId)) {
        res.status(400).json({ error: "ID de livre invalide." });
        return;
    }

    try {
        // ✅ Vérifie si le livre existe
        const booksResult = await db.select().from(books).where(eq(books.id, parsedBookId));
        const book = booksResult[0];

        if (!book) {
            res.status(404).json({ error: "Livre introuvable." });
            return;
        }

        // ✅ Vérifie si le livre est gratuit
        const price = parseFloat((book.price ?? "0").toString()); // ✅ Utilisation sûre avec valeur par défaut

        if (price > 0) {
            res.status(400).json({ error: "Ce livre n'est pas gratuit." });
            return;
        }

        // ✅ Vérifie si l'utilisateur possède déjà ce livre
        const existingEntries = await db.select().from(userBooks).where(
            and(eq(userBooks.userId, userId), eq(userBooks.bookId, parsedBookId))
        );

        if (existingEntries.length) {
            res.status(400).json({ error: "Ce livre est déjà dans votre bibliothèque." });
            return;
        }

        // ✅ Ajoute le livre gratuit à la bibliothèque personnelle
        await db.insert(userBooks).values({
            userId: userId,
            bookId: parsedBookId,
        });

        res.status(200).json({ message: "Livre gratuit ajouté à votre bibliothèque." });
    } catch (error) {
        console.error("Erreur lors de l'ajout du livre gratuit :", error);
        res.status(500).json({ error: "Erreur lors de l'ajout du livre." });
    }
};
