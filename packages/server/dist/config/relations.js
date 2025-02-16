import { relations } from "drizzle-orm/relations";
import { users, authors, books, userWrittenBooks, userBooks } from "./schema.js";
// ✅ Relations des auteurs avec les livres
export const authorsRelations = relations(authors, ({ many }) => ({
    books: many(books), // Un auteur peut avoir plusieurs livres
}));
// ✅ Relations des livres avec les auteurs
export const booksRelations = relations(books, ({ one }) => ({
    author: one(authors, {
        fields: [books.authorId],
        references: [authors.id],
    }),
}));
// ✅ Relations des livres possédés par les utilisateurs
export const userBooksRelations = relations(userBooks, ({ one }) => ({
    user: one(users, {
        fields: [userBooks.userId],
        references: [users.id],
    }),
    book: one(books, {
        fields: [userBooks.bookId],
        references: [books.id],
    }),
}));
// ✅ Relations des livres écrits par les utilisateurs (⚠️ Correction avec bookId)
export const userWrittenBooksRelations = relations(userWrittenBooks, ({ one }) => ({
    user: one(users, {
        fields: [userWrittenBooks.userId],
        references: [users.id],
    }),
    book: one(books, {
        fields: [userWrittenBooks.bookId], // 🔥 Correction avec bookId
        references: [books.id],
    }),
}));
