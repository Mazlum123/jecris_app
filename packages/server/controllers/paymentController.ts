import { Request, Response } from "express";
import { stripe } from "../config/stripe.js";
import { db } from "../config/db.js";
import { userBooks } from "../models/userBooksModel.js";
import { books } from "../models/bookModel.js";
import { cart } from "../models/cartModel.js";
import { eq } from "drizzle-orm";

// ✅ Création de paiement avec Stripe
export const createPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Utilisateur non authentifié." });
            return;
        }

        // Récupérer les livres dans le panier de l'utilisateur
        const cartItems = await db
            .select({ id: books.id, title: books.title, price: books.price })
            .from(cart)
            .innerJoin(books, eq(cart.bookId, books.id))
            .where(eq(cart.userId, userId));

        if (cartItems.length === 0) {
            res.status(400).json({ error: "Le panier est vide." });
            return;
        }

        // Création de la session Stripe
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
            success_url: "http://localhost:5000/api/payment/success",
            cancel_url: "http://localhost:5000/api/payment/cancel",
            metadata: { userId: userId.toString() },
        });

        res.json({ url: session.url });

    } catch (error) {
        console.error("❌ Erreur création paiement :", error);
        res.status(500).json({ error: "Erreur lors de la création du paiement." });
    }
};

// ✅ Webhook Stripe pour gérer la finalisation du paiement
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

            if (!userId) {
                console.error("❌ userId manquant !");
                res.status(400).json({ error: "userId manquant." });
                return;
            }

            // 🔍 Récupérer les livres du panier
            const cartItems = await db.select().from(cart).where(eq(cart.userId, parseInt(userId)));

            if (cartItems.length === 0) {
                console.error("❌ Aucun livre trouvé dans le panier !");
                res.status(400).json({ error: "Aucun livre trouvé dans le panier." });
                return;
            }

            // 📚 Ajouter tous les livres à la bibliothèque de l'utilisateur
            await db.insert(userBooks).values(
                cartItems.map((item) => ({
                    userId: parseInt(userId),
                    bookId: item.bookId,
                    lastPageRead: 1,
                }))
            );

            // 🗑 Vider le panier après l'achat
            await db.delete(cart).where(eq(cart.userId, parseInt(userId)));

            console.log(`📚 ${cartItems.length} livres ajoutés à la bibliothèque de l'utilisateur ${userId}`);

            res.json({ message: "Paiement validé, livres ajoutés !" });
        }

        res.json({ received: true });
    } catch (error) {
        console.error("❌ Erreur Webhook:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

// ✅ Confirmation après paiement réussi
export const paymentSuccess = async (req: Request, res: Response): Promise<void> => {
    res.json({ message: "Paiement réussi ! Les livres ont été ajoutés à votre bibliothèque." });
};

// ❌ Message en cas d'annulation du paiement
export const paymentCancel = async (req: Request, res: Response): Promise<void> => {
    res.json({ message: "Paiement annulé." });
};