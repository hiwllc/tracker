import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { categories, Category } from "./categories";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const transactionsType = pgEnum("transactions_type", [
  "INCOME",
  "OUTCOME",
]);

export const transactionsInterval = pgEnum("transactions_interval", [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
  "INSTALLMENTS",
  "UNIQUE",
]);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: transactionsType("type").default("OUTCOME").notNull(),
  interval: transactionsInterval("interval").default("UNIQUE").notNull(),
  installments: integer("installments"),
  value: integer("value").notNull(),
  category: uuid("category_id")
    .notNull()
    .references(() => categories.id, {
      onDelete: "set null",
    }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  dueAt: timestamp("due_at", { mode: "date", withTimezone: true }).notNull(),
  paidAt: timestamp("paid_at", { mode: "date", withTimezone: true }),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.category],
    references: [categories.id],
  }),
}));

export type Transaction = typeof transactions.$inferSelect & {
  category: Pick<Category, "name">;
};

export const createTransactionSchema = createInsertSchema(transactions);
