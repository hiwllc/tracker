import { auth } from "@clerk/nextjs/server";
import { type Database, db } from "..";
import {
  addMonths,
  addYears,
  differenceInMonths,
  differenceInYears,
  endOfMonth,
  startOfMonth,
} from "date-fns";
import {
  balance,
  type Category,
  createTransactionSchema,
  type Transaction,
  transactions,
} from "../schemas";
import { z } from "zod";
import { and, desc, eq, notInArray, or } from "drizzle-orm";
import crypto from "node:crypto";

const createTransactionPayload = createTransactionSchema.omit({
  id: true,
  user: true,
  paidAt: true,
  nextDueAt: true,
  createdAt: true,
  deletedAt: true,
  updatedAt: true,
});

export const updateTransactionPayload = createTransactionSchema
  .merge(
    z.object({
      id: z.string().uuid(),
      name: z.string().optional(),
      value: z.number().optional(),
      category: z.string().uuid().optional(),
      dueAt: z.date().optional(),
      paidAt: z.date().nullable(),
    }),
  )
  .omit({
    user: true,
  });

export type PaidStatus = "paid" | "unpaid" | "all";

type AllTransactionsFilters = {
  date: Date;
  status?: PaidStatus;
  category?: string;
};

function calculateNextDueDate({
  interval,
  date,
}: {
  interval?: Transaction["interval"];
  date: Date;
}) {
  switch (interval) {
    case "MONTHLY":
      return addMonths(date, 1);
    case "YEARLY":
      return addYears(date, 1);
    default:
      return null;
  }
}

export const Transactions = {
  all: async ({
    date = startOfMonth(new Date()),
    status = "unpaid",
    category = "all",
  }: AllTransactionsFilters) => {
    const { userId } = auth();

    const isFilteredByUnpaid = status === "unpaid";
    const isFilteredByPaid = status === "paid";
    const isFilteredByCategory = category !== "all";

    const result = await db.query.transactions.findMany({
      where: (t, { and, eq, gte, lt, isNotNull, isNull }) => {
        return and(
          eq(t.user, String(userId)),
          gte(t.dueAt, date),
          lt(t.dueAt, addMonths(date, 1)),
          isFilteredByPaid ? isNotNull(t.paidAt) : undefined,
          isFilteredByUnpaid ? isNull(t.paidAt) : undefined,
          isFilteredByCategory ? eq(t.category, category) : undefined,
        );
      },
      with: {
        category: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (t, { asc }) => [asc(t.dueAt), asc(t.createdAt)],
    });

    /** here we are going to get all recurring transactions */
    const virtualized = await Transactions._recurring({
      transactions: result,
      user: String(userId),
      db,
      date,
      isFilteredByCategory,
      category,
      isFilteredByPaid,
      isFilteredByUnpaid,
    });

    return [...result, ...virtualized].map(({ category, ...transacation }) => ({
      category: category as Pick<Category, "name" | "id">,
      ...transacation,
    }));
  },

  /**
   * @private do not use this!
   */
  _recurring: async ({
    transactions,
    db,
    user,
    date,
    isFilteredByCategory,
    category,
    isFilteredByPaid,
    isFilteredByUnpaid,
  }: {
    transactions: Transaction[];
    user: string;
    db: Database;
    date: Date;
    isFilteredByCategory: boolean;
    category: string;
    isFilteredByUnpaid: boolean;
    isFilteredByPaid: boolean;
  }) => {
    /** references from current period transactions that can be filtered */
    const referencesFromFiltered = transactions
      .map(({ reference }) => reference)
      .filter(Boolean) as string[];

    /** all transactions but without filters */
    const transactionsPeriodsWithoutFilters =
      await db.query.transactions.findMany({
        where: (t, { and, eq, gte, lt }) => {
          return and(
            eq(t.user, String(user)),
            gte(t.dueAt, date),
            lt(t.dueAt, addMonths(date, 1)),
          );
        },
      });

    const referencesFromUnfiltered = transactionsPeriodsWithoutFilters
      .map(({ reference }) => reference)
      .filter(Boolean) as string[];

    const parentRecurringTransactions = await db.query.transactions.findMany({
      where: (t, { and, eq, ne, lte, isNull, isNotNull }) => {
        return and(
          eq(t.user, user),
          lte(t.nextDueAt, endOfMonth(date)),
          isNull(t.reference),
          notInArray(t.id, [
            ...referencesFromFiltered,
            ...referencesFromUnfiltered,
          ]),
          ne(t.interval, "INSTALLMENTS"),
          isFilteredByCategory ? eq(t.category, category) : undefined,
          isFilteredByPaid ? isNotNull(t.paidAt) : undefined,
          isFilteredByUnpaid ? isNull(t.paidAt) : undefined,
        );
      },
      with: {
        category: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (t, { asc }) => [asc(t.dueAt), asc(t.createdAt)],
    });

    function calculateDueAtAndNextDueAtDates(t: Transaction, date: Date) {
      switch (t.interval) {
        case "MONTHLY":
          return {
            dueAt: addMonths(
              t.dueAt,
              differenceInMonths(date, startOfMonth(t.dueAt)),
            ),
            nextDueAt: addMonths(t.nextDueAt as Date, 1),
          };
        case "YEARLY":
          return {
            dueAt: addYears(
              t.dueAt,
              differenceInYears(date, startOfMonth(t.dueAt)),
            ),
            nextDueAt: addYears(t.nextDueAt as Date, 1),
          };
        default:
          return {
            dueAt: t.dueAt,
            nextDueAt: t.nextDueAt,
          };
      }
    }

    const virtualized = parentRecurringTransactions.map((t) => {
      return {
        ...t,
        id: crypto.randomUUID(),
        reference: t.id,
        paidAt: null,
        virtual: true,
        ...calculateDueAtAndNextDueAtDates(t, date),
      };
    });

    return virtualized.flat();
  },

  create: async (data: z.input<typeof createTransactionPayload>) => {
    const { userId } = auth();

    if (data.installments) {
      const [first, ...trxs] = [...Array(data.installments).keys()].map((i) => {
        const installment = i + 1;
        const isLastInstallment = installment >= Number(data.installments);
        const nextDueAt = isLastInstallment
          ? undefined
          : addMonths(data.dueAt, installment);

        return {
          ...data,
          user: String(userId),
          installment: installment,
          dueAt: addMonths(data.dueAt, i),
          nextDueAt,
        };
      });

      return db.transaction(async (tx) => {
        const [{ id: reference }] = await tx
          .insert(transactions)
          .values(first)
          .returning({ id: transactions.id });
        await tx
          .insert(transactions)
          .values(trxs.map((t) => ({ ...t, reference })));
      });
    }

    const nextDueAt = calculateNextDueDate({
      interval: data.interval,
      date: data.dueAt,
    });

    return db.insert(transactions).values({
      user: String(userId),
      nextDueAt,
      ...data,
    });
  },

  remove: async (id: string, reference: string | null) => {
    const { userId } = auth();

    return db.transaction(async (tx) => {
      await tx
        .delete(transactions)
        .where(
          and(
            eq(transactions.user, String(userId)),
            or(
              eq(transactions.id, id),
              eq(transactions.reference, id),
              reference ? eq(transactions.id, reference) : undefined,
              reference ? eq(transactions.reference, reference) : undefined,
            ),
          ),
        );
    });
  },

  updatePaidStatus: async ({
    id,
    ...t
  }: z.infer<typeof updateTransactionPayload>) => {
    const { userId } = auth();

    return db.transaction(async (tx) => {
      const [{ balance: current }] = await tx
        .select({ balance: balance.balance })
        .from(balance)
        .where(eq(balance.user, String(userId)))
        .orderBy(desc(balance.createdAt))
        .limit(1);

      const [trx] = await tx
        .insert(transactions)
        .values({
          id,
          user: String(userId),
          name: t.name as string,
          value: Number(t.value),
          category: t.category as string,
          dueAt: t.dueAt as Date,
          ...t,
        })
        .onConflictDoUpdate({
          target: transactions.id,
          set: { paidAt: t.paidAt, updatedAt: t.paidAt },
        })
        .returning();

      const isIncome =
        (trx.type === "INCOME" && t.paidAt) ||
        (trx.type === "OUTCOME" && !t.paidAt);

      await tx.insert(balance).values({
        transaction: id,
        balance: isIncome ? current + trx.value : current - trx.value,
        user: String(userId),
      });
    });
  },
};
