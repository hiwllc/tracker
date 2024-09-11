"use client";

import type { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
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
import { CalendarIcon, LoaderIcon, PlusIcon } from "lucide-react";
import { Input } from "~/components/ui/input";
import { currency } from "~/lib/formatters";
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
import { useDisclosure } from "~/hooks/use-disclosure";
import type { ReactNode } from "react";
import { useMediaQuery } from "~/hooks/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Switch } from "~/components/ui/switch";

type Schema = z.infer<typeof schema>;

type Props = {
  categories: Array<Array<Pick<Category, "id" | "name">>>;
};

export function CreateTransactionForm({ categories: tuple }: Props) {
  const { isOpened, toggle, close } = useDisclosure({ initialState: "closed" });

  const form = useForm<Schema>({
    defaultValues: {
      type: "OUTCOME",
      name: "",
      category: "",
      value: "",
      description: "",
      dueDate: new Date(),
      interval: "UNIQUE",
      repeatable: false,
    },
  });

  const { execute, isPending } = useServerAction(createTransactionAction, {
    onFinish(result) {
      close();
      form.reset();
    },
  });

  const type = form.watch("type");
  const categories = type === "INCOME" ? tuple.at(0) : tuple.at(1);

  const onSubmit = async (data: Schema) => {
    await execute(data);
  };

  const repeatable = form.watch("repeatable");

  return (
    <ModalForm toggle={toggle} isOpened={isOpened}>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                        currency(Number(target.value.replace(/\D+/g, ""))),
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
            name="dueDate"
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
                        <SelectItem value="WEEKLY" disabled>
                          Semanal
                        </SelectItem>
                        <SelectItem value="MONTHLY">Mensal</SelectItem>
                        <SelectItem value="YEARLY" disabled>
                          Anual
                        </SelectItem>
                        <SelectItem value="INSTALLMENTS" disabled>
                          Parcelada
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
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
    </ModalForm>
  );
}

function ModalForm({
  children,
  isOpened,
  toggle,
}: {
  children: ReactNode;
  isOpened?: boolean;
  toggle: VoidFunction;
}) {
  const isDesktop = useMediaQuery("(min-width: 764px)");

  if (isDesktop) {
    return (
      <Dialog open={isOpened} onOpenChange={toggle}>
        <DialogTrigger asChild>
          <Button className="h-8 gap-2">
            <PlusIcon className="size-4" />
            Adicionar
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
            <DialogDescription>
              Cadastre sua nova transação informando os dados abaixo.
            </DialogDescription>
          </DialogHeader>

          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="h-8 gap-2">
          <PlusIcon className="size-4" />
          Adicionar
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Nova Transação</DrawerTitle>
          <DrawerDescription>
            Cadastre sua nova transação informando os dados abaixo.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-6">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
