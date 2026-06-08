"use client";

import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import { TransactionsView } from "@/components/views/transactions-view";
import { formatDate } from "@/lib/format";
import type { DashboardData, TransactionListItem } from "@/types/dashboard";

export function Transactions() {
  const [data, setData] = useState<DashboardData>({
    accounts: [],
    categories: [],
    transactions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    const response = await fetch("/api/dashboard", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Could not load transactions.");
    }

    const dashboardData = (await response.json()) as DashboardData;
    setData(dashboardData);
  }, []);

  useEffect(() => {
    async function loadInitialTransactions() {
      try {
        await loadTransactions();
      } catch (loadError: unknown) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load transactions.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialTransactions();
  }, [loadTransactions]);

  const totalSpending = useMemo(
    () =>
      data.transactions
        .filter((transaction) => transaction.amount > 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [data.transactions],
  );

  const totalIncome = useMemo(
    () =>
      data.transactions
        .filter((transaction) => transaction.amount < 0)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [data.transactions],
  );

  const transactions = useMemo<TransactionListItem[]>(
    () =>
      data.transactions.map((transaction) => ({
        accountName: transaction.account.name,
        amount: Math.abs(transaction.amount),
        categoryName: transaction.category?.name ?? "Uncategorized",
        date: formatDate(transaction.date),
        id: transaction.id,
        isIncome: transaction.amount < 0,
        name: transaction.name,
      })),
    [data.transactions],
  );

  return createElement(TransactionsView, {
    error,
    isLoading,
    totalIncome,
    totalSpending,
    transactions,
  });
}
