"use server";

import { procedure } from "~/procedures";
import { schema } from "../schemas";
import { Transactions } from "~/database/repositories/transactions";
import { number } from "~/lib/formatters";
import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";
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
