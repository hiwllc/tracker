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
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "~/components/responsive-modal";

type Props = {
  defaultOpen?: boolean;
};

const schema = z.object({
  balance: z.string().min(1, "Informe o valor inicial do seu saldo."),
});

type Schema = z.infer<typeof schema>;

export function CreateInitialBalance({ defaultOpen = false }: Props) {
  const [opened, setOpened] = useState(defaultOpen);

  const form = useForm<Schema>({
    defaultValues: {
      balance: "R$ 0,00",
    },
    resolver: zodResolver(schema),
  });

  const { execute, isPending } = useServerAction(createInitialBalance, {
    onSuccess: () => {
      form.reset();
      setOpened(false);
    },
  });

  const handleSubmit = async () => {
    await execute({ value: form.getValues("balance") });
  };

  return (
    <Modal open={opened} onOpenChange={setOpened} dismissible={false}>
      <ModalContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        closable={false}
      >
        <ModalHeader>
          <ModalTitle>Saldo inicial</ModalTitle>
          <ModalDescription>
            Informe o seu saldo inicial, para pode continuar usando a aplicação.
          </ModalDescription>
        </ModalHeader>

        <div className="px-6 md:px-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
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

              <ModalFooter className="px-0 lg:pt-4">
                <Button size="sm" className="w-full md:w-[130px]">
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
              </ModalFooter>
            </form>
          </Form>
        </div>
      </ModalContent>
    </Modal>
  );
}
