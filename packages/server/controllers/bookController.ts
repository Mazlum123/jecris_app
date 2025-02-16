import { Request, Response, RequestHandler } from "express";
import { db } from "../config/db.js";
import { books } from "../models/bookModel.js";
import { authors } from "../models/authorModel.js";
import { eq } from "drizzle-orm";

// ✅ Récupérer tous les livres
export const getAllBooks = async (req: Request, res: Response) => {
    try {
        const allBooks = await db.select().from(books);
        res.status(200).json(allBooks);
    } catch (error) {
        console.error("🚨 ERREUR SQL :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des livres." });
    }
};

// ✅ Ajout d'un livre avec authorId (⚠️ Ancienne méthode, pas utilisée si on gère `authorName`)
export const addBook: RequestHandler = async (req, res) => {
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
