"use server";

import { procedure } from "~/procedures";
import { schema } from "../schemas";
import { Transactions } from "~/database/repositories/transactions";
import { number } from "~/lib/formatters";
import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";

export const createTransactionAction = procedure
  .createServerAction()
  .input(schema)
  .handler(async ({ input }) => {
    await Transactions.create({
      ...input,
      installments: input.installments ? number(input.installments) : undefined,
      dueAt: startOfDay(input.dueAt),
      value: number(input.value),
    });
    revalidatePath("/dashboard", "page");
  });
