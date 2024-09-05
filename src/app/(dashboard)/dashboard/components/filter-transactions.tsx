"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Category } from "~/database/schemas";
import { useParams } from "~/hooks/use-params";

const status = [
  { title: "Todas as transações", value: "all" },
  { title: "Pagas", value: "paid" },
  { title: "Não Pagas", value: "unpaid" },
] as const;

type Props = {
  categories: Record<
    "income" | "outcome",
    Array<Pick<Category, "name" | "id">>
  >;
};

export function FilterTransactions({
  categories = { income: [], outcome: [] },
}: Props) {
  const { createQueryString, qs, pathname, router } = useParams();
  const current = status.find(({ value }) => value === qs.get("status"));

  return (
    <div className="flex flex-col gap-3">
      <Select
        defaultValue={current?.value}
        onValueChange={(value) =>
          router.push(pathname + "?" + createQueryString("status", value))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o status..." />
        </SelectTrigger>

        <SelectContent>
          {status.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={(qs.get("category") as string) ?? "all"}
        onValueChange={(value) =>
          router.push(pathname + "?" + createQueryString("category", value))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma categoria..." />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>

          <SelectGroup>
            <SelectLabel>Despesas</SelectLabel>

            {categories.outcome.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>Receitas</SelectLabel>

            {categories.income.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
