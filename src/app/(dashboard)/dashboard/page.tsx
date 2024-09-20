import { format, startOfMonth, toDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CreateTransactionForm } from "./components/create-transaction-form";
import { currency, number } from "~/lib/formatters";
import { Balance } from "~/database/repositories/balance";
import {
  type PaidStatus,
  Transactions,
} from "~/database/repositories/transactions";
import { ListTransactionsTable } from "./components/list-transactions-table";
import { Categories } from "~/database/repositories/categories";
import { NavigationDates } from "./components/navigation-dates";
import type { Transaction } from "~/database/schemas";
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
import { CreateInitialBalance } from "./components/create-initial-balance";
import { DEFAULT_DATE } from "../constants";
import { ToggleTheme } from "~/components/theme/toggle";

type Params = {
  date?: string;
  status?: PaidStatus;
  category?: string;
};

/**
 * this functions returns the initial data for the current
 * signedin user: categories, balance and transactions
 */
async function getUserDataForDashboard({
  date,
  category,
  status,
}: {
  date: string;
  status?: PaidStatus;
  category?: string;
}) {
  const [balance, categories, transactions] = await Promise.all([
    Balance.get(),
    Categories.all(),
    Transactions.all({ date: toDate(date), category, status }),
  ]);

  return {
    balance: balance ? currency(balance?.balance) : null,
    categories,
    transactions,
  };
}

export default async function DashboardPage({
  searchParams = {
    date: startOfMonth(new Date()).toISOString(),
    status: "unpaid",
    category: "all",
  },
}: {
  searchParams: Params;
}) {
  const { balance, categories, transactions } = await getUserDataForDashboard({
    date: searchParams.date ?? DEFAULT_DATE,
    status: searchParams.status,
    category: searchParams.category,
  });

  const expected = transactions.reduce(
    (acc, t) => {
      if (t.type === "OUTCOME") {
        acc.outcome += t.value;

        if (!t.paidAt) {
          acc.balance -= t.value;
        }
      }

      if (t.type === "INCOME") {
        acc.income += t.value;

        if (!t.paidAt) {
          acc.balance += t.value;
        }
      }

      return acc;
    },
    { income: 0, outcome: 0, balance: balance ? number(balance) : 0 },
  );

  return (
    <>
      <CreateInitialBalance defaultOpen={!balance} />
      <div className="container">
        <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-6 py-6 min-h-[calc(100dvh-160px)]">
          <aside className="flex flex-col gap-4 text-balance lg:sticky lg:top-[104px] lg:h-[calc(100dvh-120px)]">
            <div className="gap-2 hidden lg:flex">
              <CreateTransactionForm
                categories={{
                  income: categories.filter(({ type }) => type === "INCOME"),
                  outcome: categories.filter(({ type }) => type === "OUTCOME"),
                }}
              />
            </div>

            <div className="hidden lg:flex gap-2 w-full">
              <Button
                className="justify-start gap-3 h-8 capitalize w-[180px] flex-1"
                variant="outline"
                size="sm"
              >
                <CalendarIcon className="size-4" />{" "}
                {format(searchParams.date ?? DEFAULT_DATE, "MMMM, yyyy", {
                  locale: ptBR,
                })}
              </Button>

              <NavigationDates />
            </div>

            <Card className="w-full shadow-none">
              <CardHeader>
                <CardTitle className="text-md">Saldo</CardTitle>
                <CardDescription className="capitalize">
                  {format(searchParams.date ?? DEFAULT_DATE, "MMMM, yyyy", {
                    locale: ptBR,
                  })}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <h2 className="font-mono text-2xl font-bold">{balance}</h2>

                <Accordion type="single" collapsible>
                  <AccordionItem value="values" className="border-0">
                    <AccordionTrigger className="text-start text-xs text-muted-foreground">
                      Valores previstos para o fim do período
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="flex flex-col">
                        <p className="text-sm whitespace-nowrap">
                          Receitas: {currency(expected.income)}
                        </p>
                        <p className="text-sm whitespace-nowrap">
                          Despesas: {currency(expected.outcome)}
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
                income: categories.filter(({ type }) => type === "INCOME"),
                outcome: categories.filter(({ type }) => type === "OUTCOME"),
              }}
            />

            <div className="mt-auto hidden lg:block">
              <ToggleTheme align="start" />
            </div>
          </aside>

          <div className="space-y-4 pb-20 lg:pb-6">
            {transactions.length <= 0 ? (
              <div className="flex flex-col items-center gap-2 w-full max-w-sm mx-auto py-10">
                <p className="text-center text-sm text-muted-foreground">
                  Você ainda não tem nenhuma transação neste período, ou com os
                  filtros aplicados.
                </p>
                <CreateTransactionForm
                  categories={{
                    income: categories.filter(({ type }) => type === "INCOME"),
                    outcome: categories.filter(
                      ({ type }) => type === "OUTCOME",
                    ),
                  }}
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

      <footer className="p-4 px-8 fixed bottom-0 bg-background w-full lg:hidden">
        <section className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <NavigationDates />
            <span className="text-xs text-muted-foreground capitalize">
              {format(searchParams.date ?? DEFAULT_DATE, "MMMM, yyyy", {
                locale: ptBR,
              })}
            </span>
          </div>

          <div className="flex gap-2">
            <CreateTransactionForm
              categories={{
                income: categories.filter(({ type }) => type === "INCOME"),
                outcome: categories.filter(({ type }) => type === "OUTCOME"),
              }}
            />

            <ToggleTheme align="end" />
          </div>
        </section>
      </footer>
    </>
  );
}
