import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import dotenv from "dotenv";
import { users } from "../models/userModel.js";
import { books } from "../models/bookModel.js";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });
export const db = drizzle(sql, { schema: { users, books } });

console.log("✅ Connexion à PostgreSQL initialisée...");