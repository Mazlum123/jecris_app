import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });
export const db = drizzle(sql);

console.log("✅ Connexion à PostgreSQL initialisée...");