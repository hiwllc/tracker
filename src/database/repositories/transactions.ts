import { auth } from "@clerk/nextjs/server";
import { db } from "..";
import {
  addMonths,
  differenceInMonths,
  endOfMonth,
  startOfMonth,
} from "date-fns";
import {
  balance,
  Category,
  createTransactionSchema,
  transactions,
} from "../schemas";
import { z } from "zod";
import { and, desc, eq, or } from "drizzle-orm";
import crypto from "node:crypto";

const createTransactionPayload = createTransactionSchema.omit({
  id: true,
  user: true,
  paidAt: true,
  installments: true,
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

export const Transactions = {
  all: async ({
    date = startOfMonth(new Date()),
    status = "unpaid",
    category = "all",
  }: {
    date: Date;
    status?: "all" | "paid" | "unpaid";
    category?: string;
  }) => {
    const { userId } = auth();

    const result = await db.query.transactions.findMany({
      where: (trx, { and, eq, gte, lt, isNull, isNotNull }) => {
        return and(
          eq(trx.user, String(userId)),
          gte(trx.dueAt, date),
          lt(trx.dueAt, addMonths(date, 1)),
          category === "all" ? undefined : eq(trx.category, category),
          status === "all"
            ? undefined
            : status === "unpaid"
              ? isNull(trx.paidAt)
              : isNotNull(trx.paidAt),
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
      orderBy: (trx, { asc }) => [asc(trx.dueAt), asc(trx.createdAt)],
    });

    // references não pode ter status
    const references = result
      .map(({ reference }) => reference)
      .filter(Boolean) as string[];

    const time = await db.query.transactions.findMany({
      where: (t, { and, eq, gte, lt }) =>
        and(
          eq(t.user, String(userId)),
          gte(t.dueAt, date),
          lt(t.dueAt, addMonths(date, 1)),
        ),
    });

    const timeRef = time
      .map(({ reference }) => reference)
      .filter(Boolean) as string[];

    const recurrency = await db.query.transactions.findMany({
      where: (t, { and, eq, lte, isNull, isNotNull, notInArray }) => {
        return and(
          eq(t.user, String(userId)),
          lte(t.nextDueAt, endOfMonth(date)),
          isNull(t.reference),

          notInArray(t.id, [...references, ...timeRef]),

          category === "all" ? undefined : eq(t.category, category),
          status === "all"
            ? undefined
            : status === "unpaid"
              ? isNull(t.paidAt)
              : isNotNull(t.paidAt),
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

    // @todo seperate this in another funcion
    const virtualized = recurrency.map((t) => {
      const dueAt = addMonths(
        t.dueAt,
        differenceInMonths(date, startOfMonth(t.dueAt)),
      );
      const nextDueAt = addMonths(t.nextDueAt as Date, 1);

      return {
        ...t,
        id: crypto.randomUUID(),
        reference: t.id,
        dueAt,
        nextDueAt,
        paidAt: null,
        virtual: true,
      };
    });

    return [...result, ...virtualized].map(({ category, ...transacation }) => ({
      category: category as Pick<Category, "name" | "id">,
      ...transacation,
    }));
  },

  /** @todo calculate the next due date from transaction */
  // calculate next due date in monthly
  // calcular next due date in weekly
  // calcular next due date in yearly
  create: async (data: z.input<typeof createTransactionPayload>) => {
    const { userId } = auth();

    /** @todo calcular próxima data para weekly and yearly */
    const nextDueAt =
      data.interval === "MONTHLY" ? addMonths(data.dueAt, 1) : null;

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
