import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import dotenv from "dotenv";
import { users } from "../models/userModel.js";
import { books } from "../models/bookModel.js";
import { userBooks } from "../models/userBooksModel.js";
import { cart } from "../models/cartModel.js";
import { payments } from "../models/paymentModel.js";
import { authors } from "../models/authorModel.js";
dotenv.config();
const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });
export const db = drizzle(sql, { schema: { users, books, userBooks, cart, payments, authors } }); // ✅ Ajout ici aussi
console.log("✅ Connexion à PostgreSQL initialisée...");
