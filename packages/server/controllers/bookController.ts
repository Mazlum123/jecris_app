import { Request, Response, RequestHandler } from "express";
import { db } from "../config/db.js";
import { books } from "../models/bookModel.js";
import { authors } from "../models/authorModel.js";
import { eq } from "drizzle-orm";

export const getAllBooks = async (req: Request, res: Response) => {
    try {
        const allBooks = await db.select().from(books).leftJoin(authors, eq(books.authorId, authors.id));

        const booksWithAuthors = allBooks.map((record) => ({
            ...record.books,
            author: record.authors ? record.authors.name : "Auteur inconnu",
            isFree: parseFloat(record.books.price ?? "0") === 0,
        }));

        res.status(200).json({
            status: 'success',
            message: "Livres récupérés avec succès",
            data: booksWithAuthors
        });
    } catch (error) {
        console.error("🚨 ERREUR SQL :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de la récupération des livres.",
            data: null
        });
    }
};

export const getBookById = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookId = parseInt(req.params.bookId, 10);

        if (isNaN(bookId)) {
            res.status(400).json({
                status: 'error',
                message: "Book ID invalide.",
                data: null
            });
            return;
        }

        const book = await db.select().from(books).leftJoin(authors, eq(books.authorId, authors.id)).where(eq(books.id, bookId)).limit(1);

        if (!book.length) {
            res.status(404).json({
                status: 'error',
                message: "Livre non trouvé.",
                data: null
            });
            return;
        }

        const bookWithAuthor = {
            ...book[0].books,
            author: book[0].authors ? book[0].authors.name : "Auteur inconnu",
        };

        res.status(200).json({
            status: 'success',
            message: "Livre trouvé",
            data: bookWithAuthor
        });
    } catch (error) {
        console.error("❌ Erreur récupération livre :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur serveur lors de la récupération du livre.",
            data: null
        });
    }
};

export const addBook: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { title, description, authorId } = req.body;

        if (!title || !authorId) {
            res.status(400).json({
                status: 'error',
                message: "Le titre et l'ID de l'auteur sont requis.",
                data: null
            });
            return;
        }

        const newBook = await db.insert(books).values({
            title,
            description: description || "",
            content: "Contenu par défaut",
            authorId,
        }).returning();

        res.status(201).json({
            status: 'success',
            message: "Livre ajouté avec succès !",
            data: newBook[0],
            book: newBook[0]
        });
    } catch (error) {
        console.error("🚨 ERREUR SQL :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de l'ajout du livre.",
            data: null
        });
    }
};

export const createBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, authorName, content, image, price, description } = req.body;

        if (!title || !authorName) {
            res.status(400).json({
                status: 'error',
                message: "Le titre et le nom de l'auteur sont requis.",
                data: null
            });
            return;
        }

        let author = await db.select().from(authors).where(eq(authors.name, authorName)).limit(1);

        if (author.length === 0) {
            const insertedAuthors = await db.insert(authors).values({ name: authorName }).returning();
            author = insertedAuthors;
        }

        if (!author[0] || !author[0].id) {
            res.status(500).json({
                status: 'error',
                message: "Erreur lors de la récupération de l'auteur.",
                data: null
            });
            return;
        }

        const newBook = await db.insert(books).values({
            title,
            authorId: author[0].id,
            content: content || "Contenu par défaut",
            image,
            price: price || "0",
            description: description || "",
        }).returning();

        res.status(201).json({
            status: 'success',
            message: "Livre ajouté avec succès",
            data: newBook[0],
            book: newBook[0]
        });

    } catch (error) {
        console.error("❌ Erreur lors de la création du livre :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur.",
            data: null
        });
    }
};

export const updateBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookId = parseInt(req.params.bookId, 10);
        const { title, description, price } = req.body;

        if (isNaN(bookId)) {
            res.status(400).json({
                status: 'error',
                message: "Book ID invalide.",
                data: null
            });
            return;
        }

        const updatedBook = await db.update(books)
            .set({ title, description, price })
            .where(eq(books.id, bookId))
            .returning();

        if (!updatedBook.length) {
            res.status(404).json({
                status: 'error',
                message: "Livre non trouvé.",
                data: null
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            message: "Livre mis à jour.",
            data: updatedBook[0],
            book: updatedBook[0]
        });
    } catch (error) {
        console.error("❌ Erreur mise à jour livre :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de la mise à jour du livre.",
            data: null
        });
    }
};

export const deleteBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookId = parseInt(req.params.bookId, 10);

        if (isNaN(bookId)) {
            res.status(400).json({
                status: 'error',
                message: "Book ID invalide.",
                data: null
            });
            return;
        }

        const deletedBook = await db.delete(books)
            .where(eq(books.id, bookId))
            .returning();

        if (!deletedBook.length) {
            res.status(404).json({
                status: 'error',
                message: "Livre non trouvé.",
                data: null
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            message: "Livre supprimé avec succès.",
            data: null
        });
    } catch (error) {
        console.error("❌ Erreur suppression livre :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de la suppression du livre.",
            data: null
        });
    }
};