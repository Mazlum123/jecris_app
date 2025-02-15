import { RequestHandler } from "express";
import { db } from "../config/db.js";
import { cart } from "../models/cartModel.js";
import { books } from "../models/bookModel.js";
import { eq, and } from "drizzle-orm";

export const addToCart: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { bookId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: "Utilisateur non authentifié." });
            return;
        }

        if (!bookId || typeof bookId !== "number") {
            res.status(400).json({ error: "bookId est requis et doit être un nombre valide." });
            return;
        }

        // Vérifier si le livre existe
        const book = await db.select().from(books).where(eq(books.id, bookId));
        if (!book.length) {
            res.status(404).json({ error: `Livre avec ID ${bookId} introuvable.` });
            return;
        }

        // Vérifier si le livre est déjà dans le panier
        const existingEntry = await db
            .select()
            .from(cart)
            .where(and(eq(cart.userId, userId), eq(cart.bookId, bookId)));

        if (existingEntry.length) {
            res.status(400).json({ error: "Ce livre est déjà dans votre panier." });
            return;
        }

        // Ajouter le livre au panier
        await db.insert(cart).values({ userId, bookId });
        res.status(201).json({ message: `Livre ID ${bookId} ajouté au panier.` });

    } catch (error) {
        console.error("🚨 Erreur ajout panier :", error);
        res.status(500).json({ error: "Erreur lors de l'ajout au panier." });
    }
};

export const getCart: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Utilisateur non authentifié." });
            return;
        }

        const cartItems = await db
            .select({ id: books.id, title: books.title, price: books.price })
            .from(cart)
            .innerJoin(books, eq(cart.bookId, books.id))
            .where(eq(cart.userId, userId));

        res.status(200).json(cartItems);
    } catch (error) {
        console.error("🚨 Erreur récupération panier :", error);
        res.status(500).json({ error: "Erreur lors de la récupération du panier." });
    }
};

export const removeFromCart: RequestHandler = async (req, res): Promise<void> => {
    try {
        let { bookId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: "Utilisateur non authentifié." });
            return;
        }

        // Convertir bookId en nombre si c'est une chaîne
        if (typeof bookId === "string") {
            bookId = parseInt(bookId, 10);
        }

        // Vérification après conversion
        if (!bookId || isNaN(bookId)) {
            res.status(400).json({ error: "bookId est requis et doit être un nombre valide." });
            return;
        }

        // Vérification si le livre est bien dans le panier
        const existingEntry = await db
            .select()
            .from(cart)
            .where(and(eq(cart.userId, userId), eq(cart.bookId, bookId)));

        if (!existingEntry.length) {
            res.status(404).json({ error: `Livre ID ${bookId} non trouvé dans votre panier.` });
            return;
        }

        await db.delete(cart).where(and(eq(cart.userId, userId), eq(cart.bookId, bookId)));
        res.status(200).json({ message: `Livre ID ${bookId} retiré du panier.` });

    } catch (error) {
        console.error("🚨 Erreur suppression panier :", error);
        res.status(500).json({ error: "Erreur lors de la suppression du livre du panier." });
    }
};

export const clearCart: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Utilisateur non authentifié." });
            return;
        }

        await db.delete(cart).where(eq(cart.userId, userId));
        res.status(200).json({ message: "Panier vidé avec succès." });

    } catch (error) {
        console.error("🚨 Erreur vidage panier :", error);
        res.status(500).json({ error: "Erreur lors du vidage du panier." });
    }
};
