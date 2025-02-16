import { pgTable, serial, text } from "drizzle-orm/pg-core";
export const authors = pgTable("authors", {
    id: serial().primaryKey().notNull(),
    name: text().unique().notNull(),
});
