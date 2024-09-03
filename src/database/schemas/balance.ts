import { pgTable, uuid, integer, text, timestamp } from "drizzle-orm/pg-core";
import { transactions } from "./transactions";

export const balance = pgTable("balance", {
  id: uuid("id").primaryKey().defaultRandom(),
  user: text("user_id").notNull(),
  balance: integer("balance").notNull(),
  transaction: uuid("transaction_id").references(() => transactions.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
