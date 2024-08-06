import { auth } from "@clerk/nextjs/server";
import { db } from "..";

export const Balance = {
  get: async () => {
    const { userId } = auth();

    return db.query.balance.findFirst({
      where: (balance, { eq }) => eq(balance.user, String(userId)),
      orderBy: (balance, { desc }) => desc(balance.createdAt),
    });
  },
};
