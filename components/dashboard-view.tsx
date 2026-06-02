"use client";

import { FormEvent } from "react";
import type {
  Account,
  Category,
  CategoryTotals,
  Transaction,
} from "@/types/dashboard";

type DashboardViewProps = {
  accounts: Account[];
  categories: Category[];
  categoryTotals: CategoryTotals;
  editingTransaction: Transaction | null;
  error: string | null;
  income: number;
  isLoading: boolean;
  isSubmitting: boolean;
  onCancelEdit: () => void;
  onCreateTransaction: (event: FormEvent<HTMLFormElement>) => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (event: FormEvent<HTMLFormElement>) => void;
  recentTransactions: Transaction[];
  spending: number;
  totalBalance: number;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function DashboardView({
  accounts,
  categories,
  categoryTotals,
  editingTransaction,
  error,
  income,
  isLoading,
  isSubmitting,
  onCancelEdit,
  onCreateTransaction,
  onDeleteTransaction,
  onEditTransaction,
  onUpdateTransaction,
  recentTransactions,
  spending,
  totalBalance,
}: DashboardViewProps) {
  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-6 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-2 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Personal finance
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-zinc-950">
              Expense Tracker
            </h1>
          </div>
          {isLoading ? (
            <p className="text-sm text-zinc-500">Loading dashboard...</p>
          ) : null}
        </header>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Total balance</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">
              {currency.format(totalBalance)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Spending</p>
            <p className="mt-3 text-3xl font-semibold text-rose-700">
              {currency.format(spending)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Income</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-700">
              {currency.format(income)}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-5 py-4">
              <h2 className="text-base font-semibold text-zinc-950">
                Recent transactions
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="bg-zinc-100 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Account</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-5 py-4 font-medium text-zinc-950">
                        {transaction.name}
                      </td>
                      <td className="px-5 py-4 text-zinc-600">
                        {transaction.account.name}
                      </td>
                      <td className="px-5 py-4 text-zinc-600">
                        {transaction.category?.name ?? "Uncategorized"}
                      </td>
                      <td className="px-5 py-4 text-zinc-600">
                        {new Date(transaction.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            timeZone: "UTC",
                          },
                        )}
                      </td>
                      <td
                        className={`px-5 py-4 text-right font-semibold ${
                          transaction.amount < 0
                            ? "text-emerald-700"
                            : "text-zinc-950"
                        }`}
                      >
                        {currency.format(Math.abs(transaction.amount))}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                            disabled={isSubmitting}
                            onClick={() => onEditTransaction(transaction)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                            disabled={isSubmitting}
                            onClick={() => onDeleteTransaction(transaction.id)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-950">
              Spending by category
            </h2>
            <div className="mt-5 flex flex-col gap-4">
              {Object.entries(categoryTotals).map(([name, category]) => (
                <div key={name}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="truncate font-medium text-zinc-700">
                        {name}
                      </span>
                    </div>
                    <span className="font-semibold text-zinc-950">
                      {currency.format(category.total)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: category.color,
                        width:
                          spending > 0
                            ? `${Math.min((category.total / spending) * 100, 100)}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="border-b border-zinc-200 pb-4">
            <h2 className="text-base font-semibold text-zinc-950">
              New transaction
            </h2>
          </div>
          <form
            className="mt-5 grid gap-4 lg:grid-cols-6"
            onSubmit={onCreateTransaction}
          >
            <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 lg:col-span-2">
              Name
              <input
                className="h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="name"
                placeholder="Coffee shop"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
              Amount
              <input
                className="h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="amount"
                placeholder="12.50"
                required
                step="0.01"
                type="number"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
              Date
              <input
                className="h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="date"
                required
                type="date"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
              Account
              <select
                className="h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="accountId"
                required
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
              Category
              <select
                className="h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="categoryId"
              >
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end lg:col-span-6">
              <button
                className="h-11 rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                disabled={isSubmitting || accounts.length === 0}
                type="submit"
              >
                {isSubmitting ? "Adding..." : "Add transaction"}
              </button>
            </div>
          </form>
        </section>

        {editingTransaction ? (
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="border-b border-zinc-200 pb-4">
              <h2 className="text-base font-semibold text-zinc-950">
                Edit transaction
              </h2>
            </div>
            <form
              className="mt-5 grid gap-4 lg:grid-cols-6"
              onSubmit={onUpdateTransaction}
            >
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 lg:col-span-2">
                Name
                <input
                  className="h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  defaultValue={editingTransaction.name}
                  name="name"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Amount
                <input
                  className="h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  defaultValue={editingTransaction.amount}
                  name="amount"
                  required
                  step="0.01"
                  type="number"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Date
                <input
                  className="h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  defaultValue={new Date(editingTransaction.date)
                    .toISOString()
                    .slice(0, 10)}
                  name="date"
                  required
                  type="date"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Account
                <select
                  className="h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  defaultValue={editingTransaction.accountId}
                  name="accountId"
                  required
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Category
                <select
                  className="h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  defaultValue={editingTransaction.categoryId ?? ""}
                  name="categoryId"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end gap-2 lg:col-span-6">
                <button
                  className="h-11 rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Saving..." : "Save changes"}
                </button>
                <button
                  className="h-11 rounded-md border border-zinc-300 px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
                  disabled={isSubmitting}
                  onClick={onCancelEdit}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        ) : null}
      </div>
    </main>
  );
}
