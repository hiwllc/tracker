import { auth } from "@clerk/nextjs/server";
import { db } from "..";
import { balance, transactions } from "../schemas";
import { and, desc, eq, gte, isNull, lt, lte, sum } from "drizzle-orm";
import { endOfMonth, startOfMonth } from "date-fns";

export const Balance = {
  get: async () => {
    const { userId } = auth();

    return db.query.balance.findFirst({
      where: (balance, { eq }) => eq(balance.user, String(userId)),
      orderBy: (balance, { desc }) => desc(balance.createdAt),
    });
  },

  expected: async (limit: Date = new Date()) => {
    const { userId } = auth();

    return db.transaction(async (tx) => {
      const [last] = await tx
        .select({ value: balance.balance })
        .from(balance)
        .where(eq(balance.user, String(userId)))
        .orderBy(desc(balance.createdAt))
        .limit(1);

      const past = await tx
        .select({ type: transactions.type, value: transactions.value })
        .from(transactions)
        .where(
          and(
            eq(transactions.user, String(userId)),
            isNull(transactions.paidAt),
            lte(transactions.dueAt, endOfMonth(limit)),
          ),
        );

      const result = past.reduce(
        (acc, trx) => {
          if (trx.type === "OUTCOME") {
            acc -= trx.value;
          }

          if (trx.type === "INCOME") {
            acc += trx.value;
          }

          return acc;
        },
        Number(last.value) || 0,
      );

      const [incomes] = await tx
        .select({ value: sum(transactions.value) })
        .from(transactions)
        .where(
          and(
            eq(transactions.type, "INCOME"),
            eq(transactions.user, String(userId)),
            gte(transactions.dueAt, startOfMonth(limit)),
            lt(transactions.dueAt, endOfMonth(limit)),
          ),
        );

      const [outcomes] = await tx
        .select({ value: sum(transactions.value) })
        .from(transactions)
        .where(
          and(
            eq(transactions.type, "OUTCOME"),
            eq(transactions.user, String(userId)),
            gte(transactions.dueAt, startOfMonth(limit)),
            lt(transactions.dueAt, endOfMonth(limit)),
          ),
        );

      return {
        balance: result,
        incomes: incomes.value,
        outcomes: outcomes.value,
      };
    });
  },
};
