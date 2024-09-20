"use client";

import { format, isBefore } from "date-fns";
import {
  LoaderIcon,
  MinusIcon,
  PlusIcon,
  Repeat2Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  TrashIcon,
  TriangleAlertIcon,
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
import type { Transaction } from "~/database/schemas";
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
import { deleteTranasctionAction } from "../../actions/delete-transaction-action";
import { ptBR } from "date-fns/locale";
import { useParams } from "~/hooks/use-params";
import Link from "next/link";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "~/components/responsive-modal";

const column = createColumnHelper<Transaction>();

type Props = {
  transactions: Array<Transaction>;
};

export function ListTransactionsTable({ transactions }: Props) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [trx, setTrx] = useState<Transaction | null>(null);
  const { pathname, createQueryString } = useParams();
  const [opened, setOpened] = useState(false);

  const update = useServerAction(updateTransactionPaidStatus);

  const remove = useServerAction(deleteTranasctionAction, {
    onSuccess: () => {
      setUpdating(null);
      setOpened(false);
    },
  });

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const columns = [
    column.accessor("name", {
      header: "Transação",
      cell: (props) => {
        const { name, category, dueAt, interval, paidAt } = props.row.original;

        return (
          <div className="flex flex-col">
            <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center">
              <div className="flex gap-2 pb-2 lg:pb-0">
                {isBefore(dueAt, new Date()) && !paidAt ? (
                  <>
                    <span className="sr-only">
                      A transação {name} está a atrasada, esta conta venceu em{" "}
                      {format(dueAt, "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                    <TriangleAlertIcon className="size-4 text-muted-foreground flex-shrink" />
                  </>
                ) : null}

                {interval !== "UNIQUE" ? (
                  <Repeat2Icon className="size-4 text-muted-foreground flex-shrink" />
                ) : null}
              </div>

              <p className="text-sm font-medium">{name}</p>
            </div>

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

        return (
          <Link
            href={`${pathname}?${createQueryString("category", category.id)}`}
          >
            <Badge variant="outline">{category.name}</Badge>
          </Link>
        );
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

        return (
          <div className="flex items-center gap-2 justify-end">
            {trx.paidAt ? (
              <Button
                size="icon"
                className="size-8 p-0"
                variant="ghost"
                onClick={() => {
                  setUpdating(trx.id);

                  update.execute({
                    ...trx,
                    category: trx.category.id,
                    paidAt: null,
                  });
                }}
                disabled={update.isPending && updating === trx.id}
                aria-disabled={update.isPending && updating === trx.id}
              >
                {update.isPending && updating === trx.id ? (
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
            ) : null}

            {!trx.paidAt ? (
              <Button
                size="icon"
                className="size-8 p-0"
                variant="ghost"
                onClick={() => {
                  setUpdating(trx.id);

                  update.execute({
                    ...trx,
                    category: trx.category.id,
                    paidAt: new Date(),
                  });
                }}
                disabled={update.isPending && updating === trx.id}
                aria-disabled={update.isPending && updating === trx.id}
              >
                {update.isPending && updating === trx.id ? (
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
            ) : null}

            <Button
              size="icon"
              className="size-8 p-0"
              variant="ghost"
              onClick={() => {
                setTrx(trx);
                setOpened(true);
              }}
            >
              <TrashIcon className="size-4" />
              <span className="sr-only">Remover a transação {trx.name}.</span>
            </Button>
          </div>
        );
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
    <>
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
        </CardContent>
      </Card>

      {trx ? (
        <Modal open={opened} onOpenChange={setOpened}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Excluir Transação</ModalTitle>
            </ModalHeader>

            <ModalDescription asChild>
              <p className="text-foreground text-sm px-6 lg:px-0 text-center lg:text-left">
                Você está excluindo uma transação, essa ação não pode ser
                desfeita,{" "}
                {trx.interval !== "UNIQUE"
                  ? "esta é uma transaçao que se repete, ao excluir esta transação as transações futuras e passadas também serão excluidas,"
                  : ""}{" "}
                tem certeza que deseja excluir?
              </p>
            </ModalDescription>

            <ModalFooter>
              <ModalClose>
                <Button type="button" size="sm" className="w-full lg:w-fit">
                  Não quero excluir
                </Button>
              </ModalClose>

              <Button
                size="sm"
                variant="destructive"
                className="w-full lg:w-[142px]"
                onClick={() => {
                  setUpdating(trx.id);
                  remove.execute({ id: trx.id, reference: trx.reference });
                }}
              >
                {remove.isPending ? (
                  <>
                    <LoaderIcon className="animate-spin size-4" />
                    <span className="sr-only">
                      removendo a transação {trx.name}
                    </span>
                  </>
                ) : (
                  "Sim, quero excluir"
                )}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : null}
    </>
  );
}
