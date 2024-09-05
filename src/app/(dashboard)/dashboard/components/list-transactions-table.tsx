"use client";

import { format } from "date-fns";
import {
  LoaderIcon,
  MinusIcon,
  PlusIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Transaction } from "~/database/schemas";
import { currency } from "~/lib/formatters";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { useServerAction } from "zsa-react";
import { updateTransactionPaidStatus } from "../../actions/update-transaction-paid";
import { useState } from "react";
import { useMediaQuery } from "~/hooks/use-media-query";

const column = createColumnHelper<Transaction>();

type Props = {
  transactions: Array<Transaction>;
};

export function ListTransactionsTable({ transactions }: Props) {
  const [updating, setUpdating] = useState<string | null>(null);
  const { execute, isPending } = useServerAction(updateTransactionPaidStatus);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const columns = [
    column.accessor("name", {
      header: "Transação",
      cell: (props) => {
        const { name, category, dueAt } = props.row.original;

        return (
          <div className="flex flex-col">
            <p className="text-sm font-medium">{name}</p>

            <div className="md:hidden flex flex-col">
              <small className="font-medium text-muted-foreground">
                {category.name}
              </small>
              <small>{format(dueAt, "dd/MM/yyyy")}</small>
            </div>
          </div>
        );
      },
    }),
    column.accessor("category", {
      header: "Categoria",
      id: "category",
      cell: (props) => {
        const category = props.getValue();

        return <Badge variant="outline">{category.name}</Badge>;
      },
    }),
    column.accessor("value", {
      header: "Valor (R$)",
      id: "value",
      cell: (props) => {
        const { type } = props.row.original;

        return (
          <span className="flex gap-1 items-center tabular-nums">
            {type === "INCOME" ? (
              <PlusIcon className="size-3" />
            ) : (
              <MinusIcon className="size-3" />
            )}{" "}
            {currency(props.getValue() ?? 0)}
          </span>
        );
      },
    }),
    column.accessor("dueAt", {
      header: "Vencimento",
      id: "due",
      cell: (props) => format(props.getValue() as Date, "dd/MM/yyyy"),
    }),
    column.accessor("paidAt", {
      header: "",
      id: "paid",
      cell: (props) => {
        const trx = props.row.original;

        if (trx.paidAt) {
          return (
            <div className="flex items-center justify-end">
              <Button
                size="icon"
                className="size-8 p-0"
                variant="ghost"
                onClick={() => {
                  setUpdating(trx.id);
                  execute({ id: trx.id, paid: false });
                }}
                disabled={isPending && updating === trx.id}
                aria-disabled={isPending && updating === trx.id}
              >
                {isPending && updating === trx.id ? (
                  <>
                    <LoaderIcon className="size-4 animate-spin" />
                    <span className="sr-only">
                      Alterando transação para não paga ou não recebida
                    </span>
                  </>
                ) : (
                  <>
                    <ThumbsDownIcon className="size-4" />
                    <span className="sr-only">
                      Marcar a transação {trx.name} como não paga ou não
                      recebida.
                    </span>
                  </>
                )}
              </Button>
            </div>
          );
        }

        if (!trx.paidAt) {
          return (
            <div className="flex items-center justify-end">
              <Button
                size="icon"
                className="size-8 p-0"
                variant="ghost"
                onClick={() => {
                  setUpdating(trx.id);
                  execute({ id: trx.id, paid: true });
                }}
                disabled={isPending && updating === trx.id}
                aria-disabled={isPending && updating === trx.id}
              >
                {isPending && updating === trx.id ? (
                  <>
                    <LoaderIcon className="size-4 animate-spin" />
                    <span className="sr-only">
                      Alterando transação para paga ou recebida
                    </span>
                  </>
                ) : (
                  <>
                    <ThumbsUpIcon className="size-4" />
                    <span className="sr-only">
                      Marcar a transação {trx.name} como paga ou recebida.
                    </span>
                  </>
                )}
              </Button>
            </div>
          );
        }
      },
    }),
  ];

  const table = useReactTable({
    columns,
    data: transactions,
    state: {
      columnVisibility: {
        category: isDesktop,
        value: true,
        due: isDesktop,
        paid: true,
      },
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((header) => (
              <TableRow key={header.id}>
                {header.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getCoreRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
