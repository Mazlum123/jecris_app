import { Request, Response } from "express";
import { stripe } from "../config/stripe.js";
import { db } from "../config/db.js";
import { userBooks } from "../models/userBooksModel.js";
import { books } from "../models/bookModel.js";
import { eq } from "drizzle-orm";

export const createPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { bookId } = req.body;
        const userId = req.user?.id;

        console.log("🔍 Vérification des paramètres de paiement...");
        console.log("📌 UserID:", userId);
        console.log("📌 BookID:", bookId);

        if (!userId) {
            console.error("❌ Erreur : Utilisateur non authentifié.");
            res.status(401).json({ error: "Utilisateur non authentifié." });
            return;
        }

        if (!bookId || isNaN(Number(bookId))) {
            console.error("❌ Erreur : BookID manquant ou invalide.");
            res.status(400).json({ error: "BookID manquant ou invalide." });
            return;
        }

        const book = await db.select().from(books).where(eq(books.id, Number(bookId)));

        if (!book.length || book[0].price === null || book[0].price === undefined) {
            console.error("❌ Erreur : Livre non trouvé ou prix invalide.");
            res.status(404).json({ error: "Livre non trouvé ou prix invalide." });
            return;
        }

        console.log("📖 Prix du livre récupéré:", book[0]?.price);

        const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
        const currency = process.env.CURRENCY ?? "eur";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: currency,
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
                userId: String(userId),
                bookId: String(bookId),
            },
        });

        console.log("✅ Session Stripe créée avec succès !");
        console.log("📝 Metadata envoyées :", session.metadata ?? "Aucune metadata");

        res.json({ url: session.url });
    } catch (error) {
        console.error("❌ Erreur lors de la création du paiement :", error);
        res.status(500).json({ error: "Erreur lors de la création du paiement." });
    }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("⚡ Webhook Stripe reçu !");

        const sig = req.headers["stripe-signature"];
        if (!sig) {
            console.error("❌ Signature Stripe manquante.");
            res.status(400).send("Signature Stripe manquante.");
            return;
        }

        let event;
        try {
            console.log("🔍 Vérification de la signature avec la clé webhook...");
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
            console.log("✅ Signature Stripe validée !");
        } catch (err) {
            console.error("❌ Erreur de vérification de la signature :", err);
            res.status(400).send("Échec de la vérification de la signature.");
            return;
        }

        console.log("🔔 Type d'événement reçu:", event.type);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            console.log("📦 Contenu complet de la session Stripe:", session);
            console.log("📦 Metadata Stripe:", session.metadata);

            const userId = session.metadata?.userId;
            const bookId = session.metadata?.bookId;

            if (!userId || !bookId) {
                console.error("❌ Métadonnées manquantes !");
                res.status(400).json({ error: "Métadonnées manquantes." });
                return;
            }

            await db.insert(userBooks).values({
                userId: parseInt(userId),
                bookId: parseInt(bookId),
                lastPageRead: 1,
            });

            console.log(`📚 Livre ${bookId} ajouté pour utilisateur ${userId}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error("❌ Erreur Webhook:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};
