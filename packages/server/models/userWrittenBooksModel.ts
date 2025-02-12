import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

// Table pour stocker les livres en cours d'écriture par un utilisateur
export const userWrittenBooks = pgTable("user_written_books", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    status: text("status").default("draft"),
    createdAt: timestamp("created_at").defaultNow(),
});