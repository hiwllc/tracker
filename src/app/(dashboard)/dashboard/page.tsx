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
  const [balance, transactions, incomeCategories, outcomeCategories] =
    await Promise.all([
      Balance.get(),
      Transactions.all({
        date: toDate(searchParams.date),
        status: searchParams.status,
        category: searchParams.category,
      }),
      Categories.income(),
      Categories.outcome(),
    ]);

  return (
    <div className="container">
      <section className="flex items-center justify-between">
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
      </section>

      <section className="flex flex-col text-balance py-6">
        <h3 className="font-mono text-sm">Saldo atual</h3>
        <h2 className="font-mono text-2xl font-bold">
          {currency(balance?.balance ?? 0)}
        </h2>
      </section>

      <div className="space-y-4">
        <FilterTransactions
          categories={{ income: incomeCategories, outcome: outcomeCategories }}
        />

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
          <ListTransactionsTable transactions={transactions as Transaction[]} />
        ) : null}
      </div>
    </div>
  );
}
