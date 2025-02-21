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
            res.status(401).json({
                status: 'error',
                message: "Utilisateur non authentifié.",
                data: null
            });
            return;
        }

        // Vérification de l'existence du livre
        const book = await db.select().from(books).where(eq(books.id, parseInt(bookId)));
        if (!book.length) {
            res.status(404).json({
                status: 'error',
                message: "Livre non trouvé dans la bibliothèque publique.",
                data: null
            });
            return;
        }

        // Vérification si le livre est déjà dans la bibliothèque
        const existingEntry = await db.select().from(userBooks).where(
            and(eq(userBooks.userId, userId), eq(userBooks.bookId, parseInt(bookId)))
        );

        if (existingEntry.length) {
            res.status(400).json({
                status: 'error',
                message: "Ce livre est déjà dans votre bibliothèque personnelle.",
                data: null
            });
            return;
        }

        // Ajout du livre
        const addedBook = await db.insert(userBooks).values({
            userId,
            bookId: parseInt(bookId),
        }).returning();

        res.status(201).json({
            status: 'success',
            message: "Livre ajouté à votre bibliothèque personnelle avec succès.",
            data: addedBook[0]
        });

    } catch (error) {
        console.error("🚨 Erreur lors de l'ajout du livre :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de l'ajout du livre.",
            data: null
        });
    }
};

export const getUserBooks: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                status: 'error',
                message: "Utilisateur non authentifié.",
                data: null
            });
            return;
        }

        const ownedBooks = await db
            .select({
                id: books.id,
                title: books.title,
                description: books.description,
                price: books.price,
                lastPageRead: userBooks.lastPageRead,
                addedAt: userBooks.addedAt
            })
            .from(userBooks)
            .innerJoin(books, eq(userBooks.bookId, books.id))
            .where(eq(userBooks.userId, userId));

        res.status(200).json({
            status: 'success',
            message: "Bibliothèque personnelle récupérée avec succès",
            data: ownedBooks,
            ownedBooks // Pour compatibilité
        });
    } catch (error) {
        console.error("🚨 Erreur récupération des livres possédés :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de la récupération des livres possédés.",
            data: null
        });
    }
};

export const removeBookFromLibrary: RequestHandler = async (req, res) => {
    try {
        const bookId = parseInt(req.params.bookId);
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                status: 'error',
                message: "Utilisateur non authentifié.",
                data: null
            });
            return;
        }

        if (isNaN(bookId)) {
            res.status(400).json({
                status: 'error',
                message: "ID de livre invalide.",
                data: null
            });
            return;
        }

        const existingEntry = await db.select().from(userBooks).where(
            and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId))
        );

        if (!existingEntry.length) {
            res.status(404).json({
                status: 'error',
                message: "Ce livre n'est pas dans votre bibliothèque.",
                data: null
            });
            return;
        }

        const removedBook = await db.delete(userBooks)
            .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)))
            .returning();

        res.status(200).json({
            status: 'success',
            message: "Livre supprimé de votre bibliothèque avec succès.",
            data: removedBook[0]
        });

    } catch (error) {
        console.error("🚨 Erreur lors de la suppression du livre :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de la suppression du livre.",
            data: null
        });
    }
};

export const addFreeBookToPersonalLibrary: RequestHandler = async (req, res) => {
    const userId = req.user?.id;
    const { bookId } = req.params;

    if (!userId) {
        res.status(401).json({
            status: 'error',
            message: "Utilisateur non authentifié.",
            data: null
        });
        return;
    }

    const safeBookId = bookId ?? "";

    if (!safeBookId || typeof safeBookId !== "string") {
        res.status(400).json({
            status: 'error',
            message: "ID de livre manquant ou invalide.",
            data: null
        });
        return;
    }

    const parsedBookId = parseInt(safeBookId, 10);

    if (isNaN(parsedBookId)) {
        res.status(400).json({
            status: 'error',
            message: "ID de livre invalide.",
            data: null
        });
        return;
    }

    try {
        const booksResult = await db.select().from(books).where(eq(books.id, parsedBookId));
        const book = booksResult[0];

        if (!book) {
            res.status(404).json({
                status: 'error',
                message: "Livre introuvable.",
                data: null
            });
            return;
        }

        const price = parseFloat((book.price ?? "0").toString());

        if (price > 0) {
            res.status(400).json({
                status: 'error',
                message: "Ce livre n'est pas gratuit.",
                data: null
            });
            return;
        }

        const existingEntries = await db.select().from(userBooks).where(
            and(eq(userBooks.userId, userId), eq(userBooks.bookId, parsedBookId))
        );

        if (existingEntries.length) {
            res.status(400).json({
                status: 'error',
                message: "Ce livre est déjà dans votre bibliothèque.",
                data: null
            });
            return;
        }

        const addedBook = await db.insert(userBooks).values({
            userId: userId,
            bookId: parsedBookId,
        }).returning();

        res.status(200).json({
            status: 'success',
            message: "Livre gratuit ajouté à votre bibliothèque.",
            data: {
                book: {
                    ...book,
                    addedAt: addedBook[0].addedAt
                }
            }
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout du livre gratuit :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de l'ajout du livre.",
            data: null
        });
    }
};