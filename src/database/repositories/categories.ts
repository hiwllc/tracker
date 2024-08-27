import { auth } from "@clerk/nextjs/server";
import { db } from "..";

export const Categories = {
  outcome: async () => {
    // @todo filter categories by user or system and outcomes
    return db.query.categories.findMany({
      where: (category, { eq }) => {
        return eq(category.type, "OUTCOME");
      },
      columns: {
        id: true,
        name: true,
      },
    });
  },

  income: async () => {
    // @todo filter categories by user or system and income
    return db.query.categories.findMany({
      where: (category, { eq }) => {
        return eq(category.type, "INCOME");
      },
      columns: {
        id: true,
        name: true,
      },
    });
  },
};
