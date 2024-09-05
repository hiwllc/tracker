import { format, startOfMonth, toDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CreateTransactionForm } from "./components/create-transaction-form";
import { currency } from "~/lib/formatters";
import { Balance } from "~/database/repositories/balance";
import { Transactions } from "~/database/repositories/transactions";
import { ListTransactionsTable } from "./components/list-transactions-table";
import { Categories } from "~/database/repositories/categories";
import { NavigationDates } from "./components/navigation-dates";
import { Transaction } from "~/database/schemas";
import { FilterTransactions } from "./components/filter-transactions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

type Params = {
  date: string;
  status?: "paid" | "unpaid" | "all";
  category?: string;
};

export default async function DashboardPage({
  searchParams = {
    date: startOfMonth(new Date()).toISOString(),
    status: "unpaid",
    category: "all",
  },
}: {
  searchParams: Params;
}) {
  const [balance, expected, transactions, incomeCategories, outcomeCategories] =
    await Promise.all([
      Balance.get(),
      Balance.expected(toDate(searchParams.date)),
      Transactions.all({
        date: toDate(searchParams.date),
        status: searchParams.status,
        category: searchParams.category,
      }),
      Categories.income(),
      Categories.outcome(),
    ]);

  return (
    <>
      <div className="container">
        <header className="hidden md:flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              className="justify-start gap-3 h-8 capitalize w-[180px]"
              variant="outline"
              size="sm"
            >
              <CalendarIcon className="size-4" />{" "}
              {format(searchParams.date, "MMMM, yyyy", {
                locale: ptBR,
              })}
            </Button>

            <NavigationDates />
          </div>

          <div className="flex gap-2">
            <CreateTransactionForm
              categories={[incomeCategories, outcomeCategories]}
            />
          </div>
        </header>

        <div className="flex flex-col md:grid md:grid-cols-[280px_1fr] gap-6 py-6">
          <section className="flex flex-col gap-4 text-balance">
            <Card className="w-full shadow-none">
              <CardHeader>
                <CardTitle className="text-md">Saldo</CardTitle>
              </CardHeader>

              <CardContent>
                <h2 className="font-mono text-2xl font-bold">
                  {currency(balance?.balance ?? 0)}
                </h2>

                <Accordion type="single" collapsible>
                  <AccordionItem value="values" className="border-0">
                    <AccordionTrigger className="text-start text-xs text-muted-foreground">
                      Valores previstos para o fim do período
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col">
                        <p className="text-sm whitespace-nowrap">
                          Receitas: {currency(expected.incomes)}
                        </p>
                        <p className="text-sm whitespace-nowrap">
                          Despesas: {currency(expected.outcomes)}
                        </p>
                        <p className="text-sm whitespace-nowrap">
                          Saldo previsto: {currency(expected.balance)}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <FilterTransactions
              categories={{
                income: incomeCategories,
                outcome: outcomeCategories,
              }}
            />
          </section>

          <div className="space-y-4 pb-20 md:pb-6">
            {transactions.length <= 0 ? (
              <div className="flex flex-col items-center gap-2 w-full max-w-sm mx-auto py-10">
                <p className="text-center text-sm text-muted-foreground">
                  Você ainda não tem nenhuma transação neste período, ou com os
                  filtros aplicados.
                </p>
                <CreateTransactionForm
                  categories={[incomeCategories, outcomeCategories]}
                />
              </div>
            ) : null}

            {transactions.length > 0 ? (
              <ListTransactionsTable
                transactions={transactions as Transaction[]}
              />
            ) : null}
          </div>
        </div>
      </div>

      <footer className="p-4 fixed bottom-0 bg-background w-full">
        <section className="flex md:hidden items-center justify-between">
          <div className="flex gap-1">
            <NavigationDates />
          </div>

          <div className="flex gap-2">
            <CreateTransactionForm
              categories={[incomeCategories, outcomeCategories]}
            />
          </div>
        </section>
      </footer>
    </>
  );
}
