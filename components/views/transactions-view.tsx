"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { TransactionListItem } from "@/types/dashboard";

type TransactionsViewProps = {
  error: string | null;
  isLoading: boolean;
  totalIncome: number;
  totalSpending: number;
  transactions: TransactionListItem[];
};

export function TransactionsView({
  error,
  isLoading,
  totalIncome,
  totalSpending,
  transactions,
}: TransactionsViewProps) {
  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-6 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Transactions
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-zinc-950">
              All activity
            </h1>
          </div>
          <nav className="flex gap-3 text-sm font-medium text-zinc-600">
            <Link className="hover:text-zinc-950" href="/">
              Dashboard
            </Link>
            <Link className="hover:text-zinc-950" href="/budget">
              Budget
            </Link>
          </nav>
        </header>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Spending</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">
              {formatCurrency(totalSpending)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Income</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          {isLoading ? (
            <p className="p-5 text-sm text-zinc-500">Loading transactions...</p>
          ) : null}

          {!isLoading && transactions.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">No transactions yet.</p>
          ) : null}

          {transactions.map((transaction) => (
            <article
              className="grid gap-3 border-b border-zinc-100 p-5 last:border-b-0 md:grid-cols-[1fr_auto]"
              key={transaction.id}
            >
              <div>
                <h2 className="font-medium text-zinc-950">
                  {transaction.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {transaction.accountName} · {transaction.categoryName} ·{" "}
                  {transaction.date}
                </p>
              </div>
              <p
                className={
                  transaction.isIncome
                    ? "font-semibold text-emerald-700"
                    : "font-semibold text-zinc-950"
                }
              >
                {formatCurrency(transaction.amount)}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
