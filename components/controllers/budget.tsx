"use client";

import { BudgetView } from "@/components/views/budget-view";
import type {
  BudgetCategorySummary,
  CategoryTotals,
  DashboardData,
} from "@/types/dashboard";
import { createElement, useCallback, useEffect, useMemo, useState } from "react";

export function Budget() {
  const [data, setData] = useState<DashboardData>({
    accounts: [],
    categories: [],
    transactions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBudget = useCallback(async () => {
    const response = await fetch("/api/dashboard", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Could not load budget data.");
    }

    const dashboardData = (await response.json()) as DashboardData;
    setData(dashboardData);
  }, []);

  useEffect(() => {
    async function loadInitialBudget() {
      try {
        await loadBudget();
      } catch (loadError: unknown) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load budget data.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialBudget();
  }, [loadBudget]);

  const spending = useMemo(
    () =>
      data.transactions
        .filter((transaction) => transaction.amount > 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [data.transactions],
  );

  const categoryTotals = useMemo(
    () =>
      data.transactions
        .filter((transaction) => transaction.amount > 0)
        .reduce<CategoryTotals>(
          (totals, transaction) => {
            const name = transaction.category?.name ?? "Uncategorized";
            const color =
              transaction.category?.color ?? "var(--category-color-default)";

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

  const categories = useMemo<BudgetCategorySummary[]>(
    () =>
      Object.entries(categoryTotals)
        .map(([name, category]) => ({
          name, 
          color: category.color,
          percent: spending > 0 ? (category.total / spending) * 100 : 0,
          total: category.total,
        }))
        .sort((first, second) => second.total - first.total),
    [categoryTotals, spending],
  );

  return createElement(BudgetView, {
    categories,
    error,
    isLoading,
    spending,
  });
}
