import { pgTable, unique, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";

// ✅ Table des utilisateurs
export const users = pgTable("users", {
    id: serial().primaryKey().notNull(),
    email: text().notNull(),
    password: text().notNull(),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    unique("users_email_unique").on(table.email),
]);

// ✅ Table des auteurs (avec unicité sur le nom)
export const authors = pgTable("authors", {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
}, (table) => [
    unique("authors_name_unique").on(table.name)
]);

// ✅ Table des livres (avec clé étrangère vers `authors`)
export const books = pgTable("books", {
    id: serial().primaryKey().notNull(),
    title: text().notNull(),
    authorId: integer("author_id").notNull().references(() => authors.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(), // Ajout de `.notNull()`
    content: text().notNull(),
    image: text(),
    price: numeric().default('0').notNull(), // `.notNull()` ajouté pour éviter les erreurs
    description: text().default('').notNull(),
}, (table) => [
    unique("books_title_unique").on(table.title) // (Optionnel) Ajout d'une unicité sur les titres
]);

// ✅ Table des livres écrits par les utilisateurs
export const userWrittenBooks = pgTable("user_written_books", {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
    title: text().notNull(),
    content: text().notNull(), // `.notNull()` ajouté pour éviter les contenus vides
    status: text().default('draft'),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

// ✅ Table des livres possédés par les utilisateurs
export const userBooks = pgTable("user_books", {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { mode: 'string' }).defaultNow().notNull(),
    lastPageRead: integer().default(1),
});


export const cart = pgTable("cart", {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { mode: "string" }).defaultNow()
});
