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
import { CalendarIcon, PlusIcon } from "lucide-react";
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

const schema = z.object({
  type: z.enum(["INCOME", "OUTCOME"]),
  name: z.string().min(1, "Adicione um nome para sua transação"),
  value: z.string(),
  description: z.string(),
  category: z.string(),
  dueDate: z.date({ coerce: true }),
  interval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "UNIQUE"]),
});

type Schema = z.infer<typeof schema>;

export function CreateTransactionForm() {
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

  return (
    <Dialog>
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
          <form className="space-y-4">
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
                        <SelectItem value="123456">Transporte</SelectItem>
                        <SelectItem value="123457">Moradia</SelectItem>
                        <SelectItem value="123458">Educação</SelectItem>
                        <SelectItem value="123459">Freelance</SelectItem>
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

            <Button size="sm" className="w-full">
              Adicionar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
