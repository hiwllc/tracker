"use server";

import { procedure } from "~/procedures";
import { Transactions } from "~/database/repositories/transactions";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// @todo use result patern { success: boolean, data | error }
export const deleteTranasctionAction = procedure
  .createServerAction()
  .input(
    z.object({
      id: z.string().uuid(),
      reference: z.string().uuid().nullable(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    await Transactions.remove(input.id, input.reference);
    revalidatePath("/dashboard", "page");
  });
