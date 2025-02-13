import { pgTable, unique, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const books = pgTable("books", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	authorId: integer("author_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	content: text().notNull(),
	image: text(),
	price: numeric().default('0'),
	description: text().default(').notNull(),
});

export const userWrittenBooks = pgTable("user_written_books", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	title: text().notNull(),
	content: text(),
	status: text().default('draft'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const userBooks = pgTable("user_books", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	bookId: integer("book_id").notNull(),
	addedAt: timestamp("added_at", { mode: 'string' }).defaultNow(),
	lastPageRead: integer().default(1),
});
