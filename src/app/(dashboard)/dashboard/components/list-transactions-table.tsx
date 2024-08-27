"use client";

import { format } from "date-fns";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
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

type Transactions = Array<Transaction>;

const column = createColumnHelper<Transaction>();

type Props = {
  transactions: Array<Transaction>;
};

export function ListTransactionsTable({ transactions }: Props) {
  const columns = [
    column.accessor("name", {
      header: "Transação",
    }),
  ];

  // categoria
  // valor
  // vencimento
  // pago ou não

  const table = useReactTable({
    columns,
    data: transactions,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Table>
      </CardContent>
    </Card>
  );
}
