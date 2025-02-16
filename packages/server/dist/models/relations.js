import { relations } from "drizzle-orm/relations";
import { authors } from "./authorModel.js";
import { users } from "./userModel.js";
import { books } from "./bookModel.js";
import { userBooks } from "./userBooksModel.js";
import { cart } from "./cartModel.js";
import { userWrittenBooks } from "./userWrittenBooksModel.js";
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
// ✅ Relations des livres écrits par les utilisateurs
export const userWrittenBooksRelations = relations(userWrittenBooks, ({ one }) => ({
    user: one(users, {
        fields: [userWrittenBooks.userId],
        references: [users.id],
    }),
    book: one(books, {
        fields: [userWrittenBooks.bookId],
        references: [books.id],
    }),
}));
// ✅ Relations des paniers avec les utilisateurs et livres
export const cartRelations = relations(cart, ({ one }) => ({
    user: one(users, {
        fields: [cart.userId],
        references: [users.id],
    }),
    book: one(books, {
        fields: [cart.bookId],
        references: [books.id],
    }),
}));
