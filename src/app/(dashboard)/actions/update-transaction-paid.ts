"use server";

import { procedure } from "~/procedures";
import {
  Transactions,
  updateTransactionPayload,
} from "~/database/repositories/transactions";
import { revalidatePath } from "next/cache";

// @todo use result patern { success: boolean, data | error }
export const updateTransactionPaidStatus = procedure
  .createServerAction()
  .input(updateTransactionPayload)
  .handler(async ({ input }) => {
    try {
      await Transactions.updatePaidStatus(input);
      revalidatePath("/dashboard", "page");

      return { status: "success" };
    } catch (error) {
      console.error(error);
      return { status: "error" };
    }
  });
