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
            res.status(401).json({
                status: 'error',
                message: "Utilisateur non authentifié.",
                data: null
            });
            return;
        }

        if (!bookId || typeof bookId !== "number") {
            res.status(400).json({
                status: 'error',
                message: "bookId est requis et doit être un nombre valide.",
                data: null
            });
            return;
        }

        const book = await db.select().from(books).where(eq(books.id, bookId));
        if (!book.length) {
            res.status(404).json({
                status: 'error',
                message: `Livre avec ID ${bookId} introuvable.`,
                data: null
            });
            return;
        }

        const existingEntry = await db
            .select()
            .from(cart)
            .where(and(eq(cart.userId, userId), eq(cart.bookId, bookId)));

        if (existingEntry.length) {
            res.status(400).json({
                status: 'error',
                message: "Ce livre est déjà dans votre panier.",
                data: null
            });
            return;
        }

        const addedItem = await db.insert(cart).values({ userId, bookId }).returning();

        res.status(201).json({
            status: 'success',
            message: `Livre ID ${bookId} ajouté au panier.`,
            data: addedItem[0]
        });

    } catch (error) {
        console.error("🚨 Erreur ajout panier :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de l'ajout au panier.",
            data: null
        });
    }
};

export const getCart: RequestHandler = async (req, res): Promise<void> => {
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

        const cartItems = await db
            .select({ id: books.id, title: books.title, price: books.price })
            .from(cart)
            .innerJoin(books, eq(cart.bookId, books.id))
            .where(eq(cart.userId, userId));

        res.status(200).json({
            status: 'success',
            message: "Panier récupéré avec succès",
            data: cartItems,
            cartItems // Pour compatibilité
        });
    } catch (error) {
        console.error("🚨 Erreur récupération panier :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de la récupération du panier.",
            data: null
        });
    }
};

export const removeFromCart: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.user?.id;
        const bookId = parseInt(req.params.bookId, 10);
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
                message: "bookId est requis et doit être un nombre valide.",
                data: null
            });
            return;
        }

        const existingEntry = await db
            .select()
            .from(cart)
            .where(and(eq(cart.userId, userId), eq(cart.bookId, bookId)));

        if (!existingEntry.length) {
            res.status(404).json({
                status: 'error',
                message: `Livre ID ${bookId} non trouvé dans votre panier.`,
                data: null
            });
            return;
        }

        const removedItem = await db
            .delete(cart)
            .where(and(eq(cart.userId, userId), eq(cart.bookId, bookId)))
            .returning();

        res.status(200).json({
            status: 'success',
            message: `Livre ID ${bookId} retiré du panier.`,
            data: removedItem[0]
        });

    } catch (error) {
        console.error("🚨 Erreur suppression panier :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de la suppression du livre du panier.",
            data: null
        });
    }
};

export const clearCart: RequestHandler = async (req, res): Promise<void> => {
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

        const clearedItems = await db
            .delete(cart)
            .where(eq(cart.userId, userId))
            .returning();

        res.status(200).json({
            status: 'success',
            message: "Panier vidé avec succès.",
            data: clearedItems
        });

    } catch (error) {
        console.error("🚨 Erreur vidage panier :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors du vidage du panier.",
            data: null
        });
    }
};