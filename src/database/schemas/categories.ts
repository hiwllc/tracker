import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const categoriesType = pgEnum("categories_type", ["INCOME", "OUTCOME"]);
export const categoriesSource = pgEnum("categories_source", ["SYSTEM", "USER"]);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  uid: text("user_id"),
  name: text("name").notNull(),
  description: text("description"),
  type: categoriesType("type").default("OUTCOME").notNull(),
  source: categoriesSource("source").default("USER").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
});