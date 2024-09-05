"use server";

import { procedure } from "~/procedures";
import { Transactions } from "~/database/repositories/transactions";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const deleteTranasctionAction = procedure
  .createServerAction()
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input, ctx }) => {
    const { user } = ctx;

    await Transactions.remove(input.id);

    revalidatePath(`/dashboard`, "page");

    return { user };
  });
