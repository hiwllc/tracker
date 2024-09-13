"use server";

import { procedure } from "~/procedures";
import { number } from "~/lib/formatters";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Balance } from "~/database/repositories/balance";

// @todo use result patern { success: boolean, data | error }
export const createInitialBalance = procedure
  .createServerAction()
  .input(
    z.object({
      value: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    await Balance.create(number(input.value));
    revalidatePath("/dashboard", "page");
  });
