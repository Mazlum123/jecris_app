import { pgTable, serial, text, unique } from "drizzle-orm/pg-core";

export const authors = pgTable("authors", {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
}, (table) => [
    unique("authors_name_unique").on(table.name),
]);
