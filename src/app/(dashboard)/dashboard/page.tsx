import { format, startOfMonth, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  MoveLeftIcon,
  MoveRightIcon,
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
import { CreateTransactionForm } from "./components/create-transaction-form";
import { currency } from "~/lib/formatters";

const trxs = [
  {
    name: "Escola",
    description: "Mensalidade escolar das crianças",
    value: 122000,
    type: "OUTCOME",
    category: {
      id: "12321",
      name: "Educação",
    },
    paid: false,
    dueDate: addDays(new Date(), 10),
  },
  {
    name: "Apartamento",
    value: 140000,
    type: "OUTCOME",
    description: "Mensalidade do financiamento do apartamento",
    category: {
      id: "182726",
      name: "Moradia",
    },
    paid: false,
    dueDate: addDays(new Date(), 10),
  },
  {
    name: "Salário",
    value: 872000,
    type: "INCOME",
    description: "Salário da Band.",
    category: {
      id: "182729",
      name: "Salário",
    },
    paid: true,
    dueDate: new Date(),
  },
];

export default async function DashboardPage() {
  const start = startOfMonth(new Date());

  return (
    <div className="container">
      <section className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            className="justify-between gap-3 h-8 capitalize"
            variant="outline"
            size="sm"
          >
            <CalendarIcon className="size-4" />{" "}
            {format(start, "MMMM, yyyy", { locale: ptBR })}
          </Button>

          <Button className="h-8 p-0" size="icon" variant="outline">
            <MoveLeftIcon className="size-4" />
            <span className="sr-only">Período anterior</span>
          </Button>
          <Button className="h-8 p-0" size="icon" variant="outline">
            <MoveRightIcon className="size-4" />
            <span className="sr-only">Próximo período</span>
          </Button>
        </div>

        <div className="flex gap-2">
          <CreateTransactionForm />
        </div>
      </section>

      <section className="flex flex-col text-balance py-6">
        <h3 className="font-mono text-sm">Saldo atual</h3>
        <h2 className="font-mono text-2xl font-bold">R$ 10,69</h2>
      </section>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transação</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {trxs.map((trx) => (
                <TableRow key={trx.name}>
                  <TableCell>{trx.name}</TableCell>
                  <TableCell>{trx.category.name}</TableCell>
                  <TableCell>{currency(trx.value)}</TableCell>
                  <TableCell>{format(trx.dueDate, "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      {trx.paid ? (
                        <Button
                          size="icon"
                          className="size-8 p-0"
                          variant="ghost"
                        >
                          <ThumbsUpIcon className="size-4" />
                          <span className="sr-only">Esta conta foi paga</span>
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          className="size-8 p-0"
                          variant="ghost"
                        >
                          <ThumbsDownIcon className="size-4" />
                          <span className="sr-only">
                            Esta conta ainda não foi paga
                          </span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
