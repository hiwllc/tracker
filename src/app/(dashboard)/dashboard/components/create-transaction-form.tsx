"use client";

import type { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { CalendarIcon, LoaderIcon, MenuIcon, PlusIcon } from "lucide-react";
import { Input } from "~/components/ui/input";
import { currency, number } from "~/lib/formatters";
import { Textarea } from "~/components/ui/textarea";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import type { Category } from "~/database/schemas";
import type { schema } from "../../schemas";
import { useServerAction } from "zsa-react";
import { createTransactionAction } from "../../actions/create-transaction-action";

import { useState } from "react";
import { useMediaQuery } from "~/hooks/use-media-query";

import { Switch } from "~/components/ui/switch";

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "~/components/responsive-modal";
import { cn } from "~/lib/utils";

type Schema = z.infer<typeof schema>;

type Props = {
  categories: Record<
    "income" | "outcome",
    Array<Pick<Category, "id" | "name">>
  >;
};

export function CreateTransactionForm({
  categories: { income, outcome },
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 764px)");
  const [opened, setOpened] = useState(false);

  const form = useForm<Schema>({
    defaultValues: {
      type: "OUTCOME",
      name: "",
      category: "",
      value: "",
      description: "",
      dueAt: new Date(),
      interval: "UNIQUE",
      installments: "",
      repeatable: false,
    },
  });

  const { execute, isPending } = useServerAction(createTransactionAction, {
    onFinish(result) {
      setOpened(false);
      form.reset();
    },
  });

  const type = form.watch("type");
  const categories = type === "INCOME" ? income : outcome;
  const hasInstallments = form.watch("interval") === "INSTALLMENTS";

  const onSubmit = async (data: Schema) => {
    await execute(data);
  };

  const repeatable = form.watch("repeatable");

  return (
    <Modal open={opened} onOpenChange={setOpened}>
      <ModalTrigger>
        <Button
          variant={isDesktop ? "default" : "secondary"}
          className={cn("h-8 gap-2 flex-1", { "size-8 p-0": !isDesktop })}
        >
          <PlusIcon className="size-4" />
          <span className="sr-only lg:not-sr-only">
            Adicionar nova transação
          </span>
        </Button>
      </ModalTrigger>

      <ModalContent>
        <ModalHeader>
          <ModalTitle>Nova Transação</ModalTitle>
          <ModalDescription>
            Cadastre sua nova transação informando os dados abaixo.
          </ModalDescription>
        </ModalHeader>

        <div className="px-6 md:px-0">
          <Form {...form}>
            <form
              className="space-y-4 pb-6 md:pb-0"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 [&>*]:flex-1">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo de transação" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="INCOME">Receita</SelectItem>
                            <SelectItem value="OUTCOME">Despesa</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>

                          <SelectContent>
                            {(categories ?? []).map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={({ target }) => {
                          form.setValue(
                            "value",
                            currency(number(target.value)),
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimento</FormLabel>

                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className="w-full justify-start gap-2"
                            size="sm"
                            variant="outline"
                            type="button"
                          >
                            <CalendarIcon className="size-4" />

                            {field.value
                              ? format(field.value, "dd/MM/yyyy")
                              : "Selecione uma data de vencimento..."}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="repeatable"
                render={({ field }) => (
                  <FormItem className="space-y-0 items-center flex gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Essa transação se repete</FormLabel>
                  </FormItem>
                )}
              />

              {repeatable ? (
                <FormField
                  control={form.control}
                  name="interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um intervalo" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="MONTHLY">Mensal</SelectItem>
                            <SelectItem value="YEARLY">Anual</SelectItem>
                            <SelectItem value="INSTALLMENTS">
                              Parcelada
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : null}

              {hasInstallments ? (
                <FormField
                  control={form.control}
                  name="installments"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Informe o número de parcelas"
                          type="number"
                          min="2"
                        />
                      </FormControl>
                      <FormDescription>
                        As parcelas são registradas para pagamento mensal.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              ) : null}

              <Button
                size="sm"
                className="w-full"
                disabled={isPending}
                aria-disabled={isPending}
              >
                {isPending ? (
                  <LoaderIcon className="size-4 animate-spin" />
                ) : (
                  "Adicionar"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </ModalContent>
    </Modal>
  );
}
