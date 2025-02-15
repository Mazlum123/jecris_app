import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const cart = pgTable("cart", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    bookId: integer("book_id").notNull(),
    addedAt: timestamp("added_at").defaultNow(),
});