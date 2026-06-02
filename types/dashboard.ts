export type Account = {
  id: string;
  name: string;
  balance: number | null;
};

export type Category = {
  id: string;
  name: string;
  color: string | null;
};

export type Transaction = {
  id: string;
  accountId: string;
  categoryId: string | null;
  name: string;
  amount: number;
  date: string;
  account: Account;
  category: Category | null;
};

export type DashboardData = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
};

export type CategoryTotals = Record<string, { color: string; total: number }>;
