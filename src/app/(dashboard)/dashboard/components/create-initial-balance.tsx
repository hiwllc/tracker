"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useDisclosure } from "~/hooks/use-disclosure";
import { currency } from "~/lib/formatters";
import { useServerAction } from "zsa-react";
import { createInitialBalance } from "../../actions/create-initial-balanace";
import { LoaderIcon } from "lucide-react";

type Props = {
  defaultOpen?: boolean;
};

const schema = z.object({
  balance: z.string().min(1, "Informe o valor inicial do seu saldo."),
});

type Schema = z.infer<typeof schema>;

export function CreateInitialBalance({ defaultOpen }: Props) {
  const { isOpened, toggle } = useDisclosure({
    initialState: defaultOpen ? "opened" : "closed",
  });

  const form = useForm<Schema>({
    defaultValues: {
      balance: "R$ 0,00",
    },
    resolver: zodResolver(schema),
  });

  const { execute, isPending } = useServerAction(createInitialBalance, {
    onSuccess: () => {
      form.reset();
      toggle();
    },
  });

  const handleSubmit = async () => {
    await execute({ value: form.getValues("balance") });
  };

  return (
    <Dialog open={isOpened}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Saldo inicial</DialogTitle>
          <DialogDescription>
            Informe o seu saldo inicial, para pode continuar usando a aplicação.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Form {...form}>
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Inicial</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={({ target }) => {
                          form.setValue(
                            "balance",
                            currency(Number(target.value.replace(/\D+/g, ""))),
                          );
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button size="sm" className="w-[130px]">
                  {isPending ? (
                    <>
                      <LoaderIcon className="size-4 animate-spin" />
                      <span className="sr-only">
                        Salvando seu saldo inicial
                      </span>
                    </>
                  ) : (
                    "Adicionar Saldo"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
