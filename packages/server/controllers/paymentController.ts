import { Request, Response } from "express";
import { stripe } from "../config/stripe.js";
import { db } from "../config/db.js";
import { userBooks } from "../models/userBooksModel.js";
import { books } from "../models/bookModel.js";
import { cart } from "../models/cartModel.js";
import { payments } from "../models/paymentModel.js";
import { eq, inArray, and } from "drizzle-orm";

export const createPayment = async (req: Request, res: Response): Promise<void> => {
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

        if (cartItems.length === 0) {
            res.status(400).json({
                status: 'error',
                message: "Le panier est vide.",
                data: null
            });
            return;
        }

        const bookIds = cartItems.map(book => book.id);
        const metadata = {
            userId: userId.toString(),
            bookIds: JSON.stringify(bookIds)
        };

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: cartItems.map(book => ({
                price_data: {
                    currency: "eur",
                    product_data: { name: book.title },
                    unit_amount: Math.round(Number(book.price) * 100),
                },
                quantity: 1,
            })),
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/success`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: metadata
        });

        res.status(200).json({
            status: 'success',
            message: "Session de paiement créée",
            data: { sessionUrl: session.url },
            url: session.url // Pour compatibilité
        });

    } catch (error) {
        console.error("❌ Erreur création paiement :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de la création du paiement.",
            data: null
        });
    }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const sig = req.headers["stripe-signature"];

        if (!sig) {
            res.status(400).json({
                status: 'error',
                message: "Signature Stripe manquante.",
                data: null
            });
            return;
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            res.status(500).json({
                status: 'error',
                message: "Clé secrète du webhook Stripe manquante.",
                data: null
            });
            return;
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            res.status(400).json({
                status: 'error',
                message: "Échec de la vérification de la signature.",
                data: null
            });
            return;
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            if (!session.metadata?.userId || !session.metadata?.bookIds) {
                res.status(400).json({
                    status: 'error',
                    message: "userId ou bookIds manquants.",
                    data: null
                });
                return;
            }

            const userId = session.metadata.userId;
            let bookIds;

            try {
                bookIds = JSON.parse(session.metadata.bookIds) as number[];
            } catch (error) {
                res.status(400).json({
                    status: 'error',
                    message: "Erreur parsing bookIds.",
                    data: null
                });
                return;
            }

            if (!Array.isArray(bookIds) || bookIds.length === 0) {
                res.status(400).json({
                    status: 'error',
                    message: "Aucun livre trouvé dans la transaction.",
                    data: null
                });
                return;
            }

            const existingPayment = await db.select().from(payments).where(eq(payments.paymentId, event.id));
            if (existingPayment.length > 0) {
                res.status(200).json({
                    status: 'success',
                    message: "Paiement déjà enregistré.",
                    data: existingPayment[0]
                });
                return;
            }

            const alreadyOwned = await db
                .select()
                .from(userBooks)
                .where(and(eq(userBooks.userId, parseInt(userId)), inArray(userBooks.bookId, bookIds)));

            const booksToAdd = bookIds.filter(bookId => !alreadyOwned.some(owned => owned.bookId === bookId));

            if (booksToAdd.length === 0) {
                res.status(200).json({
                    status: 'success',
                    message: "Livres déjà ajoutés.",
                    data: null
                });
                return;
            }

            const insertedBooks = await db.insert(userBooks).values(
                booksToAdd.map((bookId) => ({
                    userId: parseInt(userId),
                    bookId,
                    lastPageRead: 1,
                }))
            ).returning();

            await db.delete(cart).where(and(eq(cart.userId, parseInt(userId)), inArray(cart.bookId, bookIds)));

            const payment = await db.insert(payments).values({
                paymentId: event.id,
                userId: parseInt(userId),
                amount: String(session.amount_total ?? "0"),
            }).returning();

            res.status(200).json({
                status: 'success',
                message: "Paiement validé, livres ajoutés !",
                data: {
                    addedBooks: insertedBooks,
                    payment: payment[0]
                }
            });
        } else {
            res.status(200).json({
                status: 'success',
                message: "Événement non traité",
                data: { received: true }
            });
        }

    } catch (error) {
        console.error("❌ Erreur Webhook:", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur.",
            data: null
        });
    }
};

export const paymentSuccess = (req: Request, res: Response): void => {
    res.status(200).json({
        status: 'success',
        message: "Paiement réussi ! Les livres ont été ajoutés à votre bibliothèque.",
        data: null
    });
};

export const paymentCancel = (req: Request, res: Response): void => {
    res.status(200).json({
        status: 'success',
        message: "Paiement annulé.",
        data: null
    });
};