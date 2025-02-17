import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeApiVersion = process.env.STRIPE_API_VERSION || "2025-01-27.acacia";

if (!stripeSecretKey) {
  throw new Error("❌ STRIPE_SECRET_KEY non défini dans .env !");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: stripeApiVersion as Stripe.LatestApiVersion,
});


// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
//     apiVersion: "2025-01-27.acacia",
// });