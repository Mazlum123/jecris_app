import { pgTable, serial, integer, numeric, timestamp, text, unique } from "drizzle-orm/pg-core";
// ✅ Table des paiements pour enregistrer les transactions Stripe
export const payments = pgTable("payments", {
    id: serial().primaryKey().notNull(),
    paymentId: text("payment_id").notNull(),
    userId: integer("user_id").notNull(),
    amount: numeric("amount").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
}, (table) => {
    return [
        unique("payments_payment_id_unique").on(table.paymentId) // ✅ Empêcher les doublons Stripe
    ];
});
