import { auth } from "@clerk/nextjs/server";
import { db } from "..";

export const Categories = {
  outcome: async () => {
    const { userId } = auth();

    return db.query.categories.findMany({
      where: (category, { eq, and, or }) => {
        return and(
          eq(category.type, "OUTCOME"),
          or(eq(category.source, "SYSTEM"), eq(category.user, String(userId))),
        );
      },
      columns: {
        id: true,
        name: true,
      },
    });
  },

  income: async () => {
    const { userId } = auth();

    return db.query.categories.findMany({
      where: (category, { eq, and, or }) => {
        return and(
          eq(category.type, "INCOME"),
          or(eq(category.source, "SYSTEM"), eq(category.user, String(userId))),
        );
      },
      columns: {
        id: true,
        name: true,
      },
    });
  },
};
