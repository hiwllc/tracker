import { z } from "zod";

export const schema = z.object({
  type: z.enum(["INCOME", "OUTCOME"]),
  name: z.string().min(1, "Adicione um nome para sua transação"),
  value: z.string(),
  description: z.string(),
  category: z.string(),
  dueAt: z.date(),
  interval: z.enum([
    "DAILY",
    "WEEKLY",
    "MONTHLY",
    "YEARLY",
    "UNIQUE",
    "INSTALLMENTS",
  ]),
  installments: z.string().optional(),
  repeatable: z.boolean().optional(),
});
