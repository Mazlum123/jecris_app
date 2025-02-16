import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import dotenv from "dotenv";
import * as schema from "./schema.js";
import "./relations.js";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });
export const db = drizzle(sql, { schema });

console.log("✅ Connexion à PostgreSQL initialisée...");