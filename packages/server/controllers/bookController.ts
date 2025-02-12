import { Request, Response, RequestHandler } from "express";
import { db } from "../config/db.js";
import { books } from "../models/bookModel.js";

export const getAllBooks = async (req: Request, res: Response) => {
    try {
        const allBooks = await db.select().from(books);
        res.status(200).json(allBooks);
    } catch (error) {
        console.error("🚨 ERREUR SQL :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des livres." });
    }
};


// On force Express à reconnaître 'addBook' comme un middleware
// RequestHandler est un type spécifique d'Express qui définit bien req et res.
// Ça évite à TypeScript de penser qu'on retourne une Promise<Response>.
export const addBook: RequestHandler = async (req, res) => {
    try {
        const { title, authorId } = req.body;

        if (!title || !authorId) {
            res.status(400).json({ error: "Le titre et l'ID de l'auteur sont requis." });
            return;
        }

        const newBook = await db.insert(books).values({
            title,
            content: "Contenu par défaut",
            authorId,
        }).returning();

        res.status(201).json({ message: "Livre ajouté avec succès !", book: newBook[0] });
    } catch (error) {
        console.error("🚨 ERREUR SQL :", error);
        res.status(500).json({ error: "Erreur lors de l'ajout du livre." });
    }
};