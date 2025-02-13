import { Request, Response } from "express";
import { stripe } from "../config/stripe.js";
import { db } from "../config/db.js";
import { userBooks, books } from "../models/userBooksModel.js";
import { books } from "../models/bookModel.js";
import { eq } from "drizzle-orm";

export const createPayment = async (req: Request, res: Response) => {
    const { bookId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: "Utilisateur non authentifié." });
    }

    const book = await db.select().from(books).where(eq(books.id, bookId));
    if (!book.length) {
        return res.status(404).json({ error: "Livre non trouvé." });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: book[0].title,
                            description: book[0].description || "",
                        },
                        unit_amount: Math.round(book[0].price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: {
                userId: userId.toString(),
                bookId: bookId.toString(),
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la création du paiement." });
    }
};


export const handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) return res.status(400).send("Signature manquante.");

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (err) {
        console.error("Webhook error:", err);
        return res.status(400).send("Webhook signature verification failed.");
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const bookId = session.metadata?.bookId;

        if (userId && bookId) {
            await db.insert(userBooks).values({
                userId: parseInt(userId),
                bookId: parseInt(bookId),
                lastPageRead: 1,
            });

            console.log(`📚 Livre ID ${bookId} acheté par utilisateur ID ${userId}`);
        }
    }

    res.json({ received: true });
};