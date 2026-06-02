import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const [accounts, categories, transactions] = await Promise.all([
    prisma.account.findMany({
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.transaction.findMany({
      include: {
        account: true,
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    }),
  ]);

  return {
    accounts,
    categories,
    transactions,
  };
}
