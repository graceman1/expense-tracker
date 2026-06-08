"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { BudgetCategorySummary } from "@/types/dashboard";

type BudgetViewProps = {
  categories: BudgetCategorySummary[];
  error: string | null;
  isLoading: boolean;
  spending: number;
};

export function BudgetView({
  categories,
  error,
  isLoading,
  spending,
}: BudgetViewProps) {
  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-6 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Budget</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-zinc-950">
              Category spending
            </h1>
          </div>
          <nav className="flex gap-3 text-sm font-medium text-zinc-600">
            <Link className="hover:text-zinc-950" href="/">
              Dashboard
            </Link>
            <Link className="hover:text-zinc-950" href="/transactions">
              Transactions
            </Link>
          </nav>
        </header>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Total spending</p>
          <p className="mt-3 text-3xl font-semibold text-zinc-950">
            {formatCurrency(spending)}
          </p>
        </section>

        <section className="flex flex-col gap-3">
          {isLoading ? (
            <p className="text-sm text-zinc-500">Loading budget...</p>
          ) : null}

          {!isLoading && categories.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-500 shadow-sm">
              No spending categories yet.
            </div>
          ) : null}

          {categories.map((category) => (
            <article
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
              key={category.name}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h2 className="font-medium text-zinc-950">
                    {category.name}
                  </h2>
                </div>
                <p className="font-semibold text-zinc-950">
                  {formatCurrency(category.total)}
                </p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: category.color,
                    width: `${category.percent}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                {category.percent.toFixed(1)}% of spending
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
