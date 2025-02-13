import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Loaded" : "Not Loaded");

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-01-27.acacia",
});