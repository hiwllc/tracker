import { auth } from "@clerk/nextjs/server";
import { db } from "..";
import { addMonths, startOfMonth } from "date-fns";
import {
  balance,
  Category,
  createTransactionSchema,
  transactions,
} from "../schemas";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";

const createTransactionPayload = createTransactionSchema.omit({
  id: true,
  user: true,
  paidAt: true,
  installments: true,
  createdAt: true,
  deletedAt: true,
  updatedAt: true,
});

export const Transactions = {
  // @todo filter for paid
  // @todo filter for unpaid
  // @todo filter for all
  // @todo filter by category
  all: async (date: Date = startOfMonth(new Date())) => {
    const { userId } = auth();

    const result = await db.query.transactions.findMany({
      where: (trx, { and, eq, gte, lt, isNull }) => {
        return and(
          eq(trx.user, String(userId)),
          // isNull(trx.paidAt),
          gte(trx.dueAt, date),
          lt(trx.dueAt, addMonths(date, 1)),
        );
      },
      with: {
        category: {
          columns: {
            name: true,
          },
        },
      },
      orderBy: (trx, { asc }) => asc(trx.dueAt),
    });

    return result.map(({ category, ...transacation }) => ({
      category: category as Pick<Category, "name">,
      ...transacation,
    }));
  },

  create: async (data: z.input<typeof createTransactionPayload>) => {
    const { userId } = auth();

    return db.insert(transactions).values({
      user: String(userId),
      ...data,
    });
  },

  // @todo update transaction data (with the due date is in the future don't change the balance)
  // @todo update transaction data (with the due date is in the past change the balance)

  // @todo delete transaction (with the due date is in the future don't change the balance)
  // @todo delete transaction (with the due date is in the past change the balance)

  updatePaidStatus: async ({ paid, id }: { paid: boolean; id: string }) => {
    const { userId } = auth();
    const date = new Date();

    return db.transaction(async (tx) => {
      const [{ balance: current }] = await tx
        .select({ balance: balance.balance })
        .from(balance)
        .where(eq(balance.user, String(userId)))
        .orderBy(desc(balance.createdAt))
        .limit(1);

      const [trx] = await tx
        .update(transactions)
        .set({
          paidAt: paid ? date : null,
          updatedAt: date,
        })
        .where(
          and(eq(transactions.user, String(userId)), eq(transactions.id, id)),
        )
        .returning({
          type: transactions.type,
          value: transactions.value,
        });

      const isIncome =
        (trx.type === "INCOME" && paid) || (trx.type === "OUTCOME" && !paid);

      await tx.insert(balance).values({
        transaction: id,
        balance: isIncome ? current + trx.value : current - trx.value,
        user: String(userId),
      });
    });
  },
};
