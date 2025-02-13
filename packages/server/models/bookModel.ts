import { pgTable, serial, text, integer, timestamp, numeric } from "drizzle-orm/pg-core";

// Table des livres publics
export const books = pgTable("books", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").default(""),
    content: text("content").notNull(),
    authorId: integer("author_id").notNull(),
    image: text("image"),
    price: numeric("price").default(`0`),
    createdAt: timestamp("created_at").defaultNow(),
});