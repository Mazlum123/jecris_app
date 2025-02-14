import { stripe } from "../config/stripe.js";
import { db } from "../config/db.js";
import { userBooks } from "../models/userBooksModel.js";
import { books } from "../models/bookModel.js";
import { eq } from "drizzle-orm";
export const createPayment = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Utilisateur non authentifié." });
            return;
        }
        const book = await db.select().from(books).where(eq(books.id, bookId));
        console.log("📖 Prix du livre récupéré:", book[0]?.price);
        if (!book.length || book[0].price === null || book[0].price === undefined) {
            res.status(404).json({ error: "Livre non trouvé ou prix invalide." });
            return;
        }
        const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: book[0].title,
                            description: book[0].description || "Aucune description disponible",
                        },
                        unit_amount: Math.round(Number(book[0].price) * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/cancel`,
            metadata: {
                userId: userId.toString(),
                bookId: bookId.toString(),
            },
        });
        res.json({ url: session.url });
    }
    catch (error) {
        console.error("❌ Erreur lors de la création du paiement :", error);
        res.status(500).json({ error: "Erreur lors de la création du paiement." });
    }
};
export const handleWebhook = async (req, res) => {
    try {
        const sig = req.headers["stripe-signature"];
        if (!sig) {
            res.status(400).send("Signature Stripe manquante.");
            return;
        }
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            console.error("❌ Erreur Webhook:", err);
            res.status(400).send("Échec de la vérification de la signature.");
            return;
        }
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            const bookId = session.metadata?.bookId;
            console.log(session.metadata);
            if (userId && bookId) {
                await db.insert(userBooks).values({
                    userId: parseInt(userId),
                    bookId: parseInt(bookId),
                    lastPageRead: 1,
                });
                console.log(`📚 Livre ${bookId} acheté par utilisateur ${userId}`);
            }
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error("❌ Erreur Webhook:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};
