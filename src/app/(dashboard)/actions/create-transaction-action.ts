"use server";

import { procedure } from "~/procedures";
import { schema } from "../schemas";
import { Transactions } from "~/database/repositories/transactions";
import { number } from "~/lib/formatters";
import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";

// @todo use result patern { success: boolean, data | error }
export const createTransactionAction = procedure
  .createServerAction()
  .input(schema)
  .handler(async ({ input, ctx }) => {
    await Transactions.create({
      ...input,
      dueAt: startOfDay(input.dueDate),
      value: number(input.value),
    });
    revalidatePath("/dashboard", "page");
  });
