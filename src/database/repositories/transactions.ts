import { auth } from "@clerk/nextjs/server";
import { db } from "..";
import { startOfMonth } from "date-fns";

export const Transactions = {
  // @todo filter for paid or not paid
  all: async (date: Date = startOfMonth(new Date())) => {
    const { userId } = auth();

    return db.query.transactions.findMany({
      where: (trx, { and, eq, gte, isNull }) => {
        return and(
          eq(trx.user, String(userId)),
          isNull(trx.paidAt),
          gte(trx.dueAt, date),
        );
      },
    });
  },
};
