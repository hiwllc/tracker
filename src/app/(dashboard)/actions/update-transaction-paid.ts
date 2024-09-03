"use server";

import { procedure } from "~/procedures";
import { Transactions } from "~/database/repositories/transactions";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateTransactionPaidStatus = procedure
  .createServerAction()
  .input(
    z.object({
      id: z.string().uuid(),
      paid: z.boolean(),
    }),
  )
  .handler(async ({ input }) => {
    await Transactions.updatePaidStatus(input);
    revalidatePath(`/dashboard`, "page");

    return { status: "success" };
  });
