import { Request, Response, RequestHandler } from "express";
import { db } from "../config/db.js";
import { books } from "../models/bookModel.js";
import { authors } from "../models/authorModel.js";
import { eq } from "drizzle-orm";

// ✅ Récupérer tous les livres
export const getAllBooks = async (req: Request, res: Response) => {
    try {
      const allBooks = await db.select().from(books);

      // ✅ Ajoute un champ isFree en fonction du prix
      const booksWithFreeFlag = allBooks.map((book) => ({
        ...book,
        isFree: parseFloat(book.price ?? "Prix inconnu") === 0,
      }));

      res.status(200).json(booksWithFreeFlag);
    } catch (error) {
      console.error("🚨 ERREUR SQL :", error);
      res.status(500).json({ error: "Erreur lors de la récupération des livres." });
    }
};

export const getBookById = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookId = parseInt(req.params.bookId, 10);

        if (isNaN(bookId)) {
            res.status(400).json({ error: "Book ID invalide." });
            return;
        }

        const book = await db.select().from(books).where(eq(books.id, bookId)).limit(1);

        if (!book.length) {
            res.status(404).json({ error: "Livre non trouvé." });
            return;
        }

        res.status(200).json(book[0]);
    } catch (error) {
        console.error("❌ Erreur récupération livre :", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du livre." });
    }
};

// ✅ Ajout d'un livre avec authorId (⚠️ Ancienne méthode, pas utilisée si on gère `authorName`)
export const addBook: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { title, description, authorId } = req.body;

        if (!title || !authorId) {
            res.status(400).json({ error: "Le titre et l'ID de l'auteur sont requis." });
            return;
        }

        const newBook = await db.insert(books).values({
            title,
            description: description || "",
            content: "Contenu par défaut",
            authorId,
        }).returning();

        res.status(201).json({ message: "Livre ajouté avec succès !", book: newBook[0] });
    } catch (error) {
        console.error("🚨 ERREUR SQL :", error);
        res.status(500).json({ error: "Erreur lors de l'ajout du livre." });
    }
};

// ✅ Création d'un livre avec `authorName`
export const createBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, authorName, content, image, price, description } = req.body;

        if (!title || !authorName) {
            res.status(400).json({ error: "Le titre et le nom de l'auteur sont requis." });
            return;
        }

        console.log(`📖 Création du livre: ${title} par ${authorName}`);

        // 🔍 Vérifier si l'auteur existe déjà
        let author = await db.select().from(authors).where(eq(authors.name, authorName)).limit(1);

        // ✍ Si l'auteur n'existe pas, on l'ajoute
        if (author.length === 0) {
            console.log(`✍ Ajout de l'auteur: ${authorName}`);
            const insertedAuthors = await db.insert(authors).values({ name: authorName }).returning();
            author = insertedAuthors;
        }

        if (!author[0] || !author[0].id) {
            res.status(500).json({ error: "Erreur lors de la récupération de l'auteur." });
            return;
        }

        console.log(`✅ Auteur ID récupéré: ${author[0].id}`);

        // 📚 Ajouter le livre avec l'ID de l'auteur récupéré
        const newBook = await db.insert(books).values({
            title,
            authorId: author[0].id,
            content: content || "Contenu par défaut",
            image,
            price: price || "0",
            description: description || "",
        }).returning();

        console.log("✅ Livre ajouté:", newBook);
        res.status(201).json({ message: "Livre ajouté avec succès", book: newBook[0] });

    } catch (error) {
        console.error("❌ Erreur lors de la création du livre :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

export const updateBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookId = parseInt(req.params.bookId, 10);
        const { title, description, price } = req.body;

        if (isNaN(bookId)) {
            res.status(400).json({ error: "Book ID invalide." });
            return;
        }

        const updatedBook = await db.update(books)
            .set({ title, description, price })
            .where(eq(books.id, bookId))
            .returning();

        if (!updatedBook.length) {
            res.status(404).json({ error: "Livre non trouvé." });
            return;
        }

        res.status(200).json({ message: "Livre mis à jour.", book: updatedBook[0] });
    } catch (error) {
        console.error("❌ Erreur mise à jour livre :", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du livre." });
    }
};

export const deleteBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookId = parseInt(req.params.bookId, 10);

        if (isNaN(bookId)) {
            res.status(400).json({ error: "Book ID invalide." });
            return;
        }

        const deletedBook = await db.delete(books)
            .where(eq(books.id, bookId))
            .returning();

        if (!deletedBook.length) {
            res.status(404).json({ error: "Livre non trouvé." });
            return;
        }

        res.status(200).json({ message: "Livre supprimé avec succès." });
    } catch (error) {
        console.error("❌ Erreur suppression livre :", error);
        res.status(500).json({ error: "Erreur lors de la suppression du livre." });
    }
};