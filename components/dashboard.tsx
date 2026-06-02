"use client";

import {
  createElement,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DashboardView } from "@/components/dashboard-view";
import type { CategoryTotals, DashboardData, Transaction } from "@/types/dashboard";

export function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    accounts: [],
    categories: [],
    transactions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    const response = await fetch("/api/dashboard", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Could not load dashboard data.");
    }

    const dashboardData = (await response.json()) as DashboardData;
    setData(dashboardData);
  }, []);

  useEffect(() => {
    async function loadInitialDashboard() {
      try {
        await loadDashboard();
      } catch (loadError: unknown) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load dashboard data.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialDashboard();
  }, [loadDashboard]);

  const totalBalance = useMemo(
    () =>
      data.accounts.reduce(
        (sum, account) => sum + (account.balance ?? 0),
        0,
      ),
    [data.accounts],
  );

  const spending = useMemo(
    () =>
      data.transactions
        .filter((transaction) => transaction.amount > 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [data.transactions],
  );

  const income = useMemo(
    () =>
      data.transactions
        .filter((transaction) => transaction.amount < 0)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [data.transactions],
  );

  const categoryTotals = useMemo(
    () =>
      data.transactions
        .filter((transaction) => transaction.amount > 0)
        .reduce<CategoryTotals>(
          (totals, transaction) => {
            const name = transaction.category?.name ?? "Uncategorized";
            const color = transaction.category?.color ?? "#52525b";

            totals[name] = {
              color,
              total: (totals[name]?.total ?? 0) + transaction.amount,
            };

            return totals;
          },
          {},
        ),
    [data.transactions],
  );

  function readTransactionForm(form: HTMLFormElement) {
    const formData = new FormData(form);

    return {
      accountId: formData.get("accountId"),
      categoryId: formData.get("categoryId"),
      name: formData.get("name"),
      amount: Number(formData.get("amount")),
      date: formData.get("date"),
    };
  }

  async function createTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = event.currentTarget;

    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(readTransactionForm(form)),
    });

    if (!response.ok) {
      setIsSubmitting(false);
      setError("Could not create transaction.");
      return;
    }

    form.reset();
    await loadDashboard();
    setIsSubmitting(false);
  }

  async function updateTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingTransaction) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/transactions", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editingTransaction.id,
        ...readTransactionForm(event.currentTarget),
      }),
    });

    if (!response.ok) {
      setIsSubmitting(false);
      setError("Could not update transaction.");
      return;
    }

    setEditingTransaction(null);
    await loadDashboard();
    setIsSubmitting(false);
  }

  async function removeTransaction(id: string) {
    setError(null);
    setIsSubmitting(true);

    const response = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setIsSubmitting(false);
      setError("Could not delete transaction.");
      return;
    }

    if (editingTransaction?.id === id) {
      setEditingTransaction(null);
    }

    await loadDashboard();
    setIsSubmitting(false);
  }

  return createElement(DashboardView, {
    accounts: data.accounts,
    categories: data.categories,
    categoryTotals,
    editingTransaction,
    error,
    income,
    isLoading,
    isSubmitting,
    onCancelEdit: () => setEditingTransaction(null),
    onCreateTransaction: createTransaction,
    onDeleteTransaction: removeTransaction,
    onEditTransaction: setEditingTransaction,
    onUpdateTransaction: updateTransaction,
    recentTransactions: data.transactions.slice(0, 8),
    spending,
    totalBalance,
  });
}
