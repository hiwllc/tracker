import { auth } from "@clerk/nextjs/server";
import { db } from "..";
import { balance } from "../schemas";

export const Balance = {
  create: async (value: number) => {
    const { userId } = auth();

    return db.insert(balance).values({
      balance: value,
      user: String(userId),
    });
  },

  get: async () => {
    const { userId } = auth();

    return db.query.balance.findFirst({
      where: (balance, { eq }) => eq(balance.user, String(userId)),
      orderBy: (balance, { desc }) => desc(balance.createdAt),
    });
  },
};
