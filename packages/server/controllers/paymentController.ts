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

    // Récupérer les articles du panier
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

    // Préparer les métadonnées pour Stripe
    const bookIds = cartItems.map(book => book.id);
    const metadata = {
      userId: userId.toString(),
      bookIds: JSON.stringify(bookIds)
    };

    // Créer la session de paiement Stripe
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
      message: "Session de paiement créée.",
      data: { sessionUrl: session.url },
      url: session.url
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
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("❌ Signature Stripe manquante");
    res.status(400).json({ status: 'error', message: "Signature Stripe manquante." });
    return;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("❌ Clé secrète Stripe manquante");
    res.status(500).json({ status: 'error', message: "Clé secrète Stripe manquante." });
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log("✅ Événement Stripe reçu :", event.type);
  } catch (err) {
    console.error("❌ Erreur de vérification de la signature :", err);
    res.status(400).json({ status: 'error', message: "Échec de la vérification de la signature." });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata?.userId;
    let bookIds;

    try {
      bookIds = JSON.parse(session.metadata?.bookIds || '[]');
    } catch (error) {
      console.error("❌ Erreur lors du parsing des bookIds :", error);
      res.status(400).json({ status: 'error', message: "Erreur parsing bookIds." });
      return;
    }

    console.log(`📚 Livres achetés : ${bookIds}`);
    console.log(`👤 Utilisateur : ${userId}`);

    if (!userId || bookIds.length === 0) {
      res.status(400).json({ status: 'error', message: "Données manquantes dans le webhook." });
      return;
    }

    const amountTotal = session.amount_total ?? 0;

    // Ajouter les livres à la bibliothèque
    await db.insert(userBooks).values(
      bookIds.map((bookId: number) => ({
        userId: parseInt(userId),
        bookId,
        lastPageRead: 1
      }))
    );

    // Supprimer les livres du panier
    await db.delete(cart).where(and(eq(cart.userId, parseInt(userId)), inArray(cart.bookId, bookIds)));

    // Enregistrer le paiement
    await db.insert(payments).values({
      paymentId: event.id,
      userId: parseInt(userId),
      amount: amountTotal.toString(),
    });

    console.log("✅ Paiement et ajout des livres réussis !");
    res.status(200).json({ status: 'success', message: "Paiement validé, livres ajoutés !" });
  } else {
    res.status(200).json({ status: 'success', message: "Événement non traité." });
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