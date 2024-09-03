"use client";

import { z } from "zod";
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
import { Category } from "~/database/schemas";
import { schema } from "../../schemas";
import { useServerAction } from "zsa-react";
import { createTransactionAction } from "../../actions/create-transaction-action";
import { useDisclosure } from "~/hooks/use-disclosure";

type Schema = z.infer<typeof schema>;

type Props = {
  categories: Array<Array<Pick<Category, "id" | "name">>>;
};

export function CreateTransactionForm({ categories: tuple }: Props) {
  const { isOpened, toggle } = useDisclosure({ initialState: "closed" });

  const { execute, isPending } = useServerAction(createTransactionAction, {
    onFinish(result) {
      toggle();
    },
  });

  const form = useForm<Schema>({
    defaultValues: {
      type: "OUTCOME",
      name: "",
      category: "",
      value: "",
      description: "",
      dueDate: new Date(),
      interval: "UNIQUE",
    },
  });

  const type = form.watch("type");
  const categories = type === "INCOME" ? tuple.at(0) : tuple.at(1);

  const onSubmit = async (data: Schema) => {
    await execute(data);
  };

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

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
      </DialogContent>
    </Dialog>
  );
}
