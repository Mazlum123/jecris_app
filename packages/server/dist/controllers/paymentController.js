import { stripe } from "../config/stripe.js";
import { db } from "../config/db.js";
import { userBooks } from "../models/userBooksModel.js";
import { books } from "../models/bookModel.js";
import { cart } from "../models/cartModel.js";
import { payments } from "../models/paymentModel.js";
import { eq, inArray, and } from "drizzle-orm";
export const createPayment = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            console.error("🚨 Erreur: Utilisateur non authentifié.");
            res.status(401).json({ error: "Utilisateur non authentifié." });
            return;
        }
        console.log(`✅ Utilisateur ${userId} demande un paiement.`);
        // 🔍 Récupérer les livres dans le panier de l'utilisateur
        const cartItems = await db
            .select({ id: books.id, title: books.title, price: books.price })
            .from(cart)
            .innerJoin(books, eq(cart.bookId, books.id))
            .where(eq(cart.userId, userId));
        console.log("📦 Livres dans le panier:", cartItems);
        if (cartItems.length === 0) {
            console.error("🚨 Panier vide !");
            res.status(400).json({ error: "Le panier est vide." });
            return;
        }
        const bookIds = cartItems.map(book => book.id);
        console.log("📚 Livres à acheter:", bookIds);
        // ✅ Vérifier la structure du `metadata`
        const metadata = {
            userId: userId.toString(),
            bookIds: JSON.stringify(bookIds) // 🔍 Convertir `bookIds` en JSON propre
        };
        console.log("📦 Vérification - Metadata envoyée à Stripe:", metadata);
        // 🔹 Création de la session Stripe
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
            metadata: metadata // ✅ S'assurer que le `metadata` est bien structuré
        });
        console.log(`✅ Session Stripe créée: ${session.id}`);
        console.log("📦 Metadata envoyée à Stripe:", session.metadata);
        res.json({ url: session.url });
    }
    catch (error) {
        console.error("❌ Erreur création paiement :", error);
        res.status(500).json({ error: "Erreur lors de la création du paiement." });
    }
};
// ✅ Webhook Stripe pour gérer la finalisation du paiement
export const handleWebhook = async (req, res) => {
    try {
        console.log("⚡ Webhook Stripe reçu !");
        const sig = req.headers["stripe-signature"];
        if (!sig) {
            console.error("❌ Signature Stripe manquante.");
            res.status(400).send("Signature Stripe manquante.");
            return;
        }
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("❌ Clé secrète du webhook Stripe manquante.");
            res.status(500).json({ error: "Clé secrète du webhook Stripe manquante." });
            return;
        }
        let event;
        try {
            console.log("🔍 Vérification de la signature avec la clé webhook...");
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
            console.log("✅ Signature Stripe validée !");
        }
        catch (err) {
            console.error("❌ Erreur de vérification de la signature :", err);
            res.status(400).send("Échec de la vérification de la signature.");
            return;
        }
        console.log("🔔 Type d'événement reçu:", event.type);
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            console.log("📦 Metadata Stripe complète :", session.metadata);
            if (!session.metadata?.userId || !session.metadata?.bookIds) {
                console.error("❌ userId ou bookIds manquants !");
                res.status(400).json({ error: "userId ou bookIds manquants." });
                return;
            }
            console.log("🔍 userId reçu :", session.metadata?.userId);
            console.log("🔍 bookIds reçus :", session.metadata?.bookIds);
            const userId = session.metadata.userId;
            let bookIds;
            try {
                bookIds = JSON.parse(session.metadata.bookIds);
            }
            catch (error) {
                console.error("❌ Erreur parsing des `bookIds`:", error);
                res.status(400).json({ error: "Erreur parsing bookIds." });
                return;
            }
            console.log(`📌 userId reçu: ${userId}`);
            console.log(`📌 bookIds reçus (après parsing):`, bookIds);
            if (!Array.isArray(bookIds) || bookIds.length === 0) {
                console.error("❌ Aucun livre trouvé dans la transaction !");
                res.status(400).json({ error: "Aucun livre trouvé dans la transaction." });
                return;
            }
            const existingPayment = await db.select().from(payments).where(eq(payments.paymentId, event.id));
            if (existingPayment.length > 0) {
                console.log("🚨 Paiement déjà enregistré.");
                res.status(200).json({ message: "Paiement déjà enregistré." });
                return;
            }
            // 📚 Vérifier que l'utilisateur ne possède pas déjà ces livres
            const alreadyOwned = await db
                .select()
                .from(userBooks)
                .where(and(eq(userBooks.userId, parseInt(userId)), inArray(userBooks.bookId, bookIds)));
            const booksToAdd = bookIds.filter(bookId => !alreadyOwned.some(owned => owned.bookId === bookId));
            if (booksToAdd.length === 0) {
                console.log("🚨 L'utilisateur possède déjà ces livres, on annule.");
                res.status(200).json({ message: "Livres déjà ajoutés." });
                return;
            }
            // 📚 Ajouter les livres à la bibliothèque de l'utilisateur
            const insertResult = await db.insert(userBooks).values(booksToAdd.map((bookId) => ({
                userId: parseInt(userId),
                bookId,
                lastPageRead: 1,
            }))).returning();
            console.log("✅ Livres ajoutés à la bibliothèque :", insertResult);
            // 🗑 Vider le panier après l'achat
            await db.delete(cart).where(and(eq(cart.userId, parseInt(userId)), inArray(cart.bookId, bookIds)));
            // 📝 Enregistrer le paiement
            await db.insert(payments).values({
                paymentId: event.id,
                userId: parseInt(userId),
                amount: String(session.amount_total ?? "0"),
            });
            console.log(`📚 ${booksToAdd.length} livres ajoutés à la bibliothèque de l'utilisateur ${userId}`);
            res.json({ message: "Paiement validé, livres ajoutés !" });
        }
        else {
            res.json({ received: true });
        }
    }
    catch (error) {
        console.error("❌ Erreur Webhook:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};
// ✅ Confirmation après paiement réussi
export const paymentSuccess = (req, res) => {
    console.log("✅ Paiement confirmé par Stripe !");
    res.json({ message: "Paiement réussi ! Les livres ont été ajoutés à votre bibliothèque." });
};
// ❌ Message en cas d'annulation du paiement
export const paymentCancel = (req, res) => {
    console.log("❌ Paiement annulé.");
    res.json({ message: "Paiement annulé." });
};
