import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
// Table qui associe un utilisateur à un livre qu'il possède dans sa bibliothèque personnelle
export const userBooks = pgTable("user_books", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    bookId: integer("book_id").notNull(),
    lastPageRead: integer("lastPageRead").default(1),
    addedAt: timestamp("added_at").defaultNow(),
});
