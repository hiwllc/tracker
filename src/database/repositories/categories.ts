import { auth } from "@clerk/nextjs/server";
import { db } from "..";

export const Categories = {
  all: async () => {
    const { userId } = auth();

    return db.query.categories.findMany({
      where: (category, { eq, and, or }) => {
        return or(
          eq(category.source, "SYSTEM"),
          and(eq(category.source, "USER"), eq(category.user, String(userId))),
        );
      },
      columns: {
        id: true,
        name: true,
        type: true,
      },
    });
  },
};
