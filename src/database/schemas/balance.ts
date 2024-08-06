import { pgTable, uuid, integer, text, timestamp } from "drizzle-orm/pg-core";
import { transactions } from "./transactions";

export const balance = pgTable("balance", {
  id: uuid("id").notNull().primaryKey(),
  user: text("user_id").notNull(),
  balance: integer("balance").notNull(),
  transaction: uuid("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
