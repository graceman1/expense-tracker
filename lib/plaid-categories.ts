import type { Transaction as PlaidTransaction } from "plaid";
import { prisma } from "@/lib/prisma";

const categoryColors = [
  "var(--category-color-blue)",
  "var(--category-color-red)",
  "var(--category-color-green)",
  "var(--category-color-purple)",
  "var(--category-color-orange)",
  "var(--category-color-cyan)",
  "var(--category-color-rose)",
  "var(--category-color-indigo)",
];

function formatPlaidCategoryName(category: string) {
  return category
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getPlaidCategoryName(transaction: PlaidTransaction) {
  const category =
    transaction.personal_finance_category?.primary ?? transaction.category?.[0];

  if (!category) {
    return null;
  }

  return formatPlaidCategoryName(category);
}

function getCategoryColor(name: string) {
  const colorIndex = name
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return categoryColors[colorIndex % categoryColors.length];
}

async function findOrCreatePlaidCategory(transaction: PlaidTransaction) {
  const name = getPlaidCategoryName(transaction);

  if (!name) {
    return null;
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      name,
    },
  });

  if (existingCategory) {
    return existingCategory;
  }

  return prisma.category.create({
    data: {
      name,
      color: getCategoryColor(name),
    },
  });
}

export async function getProcessedPlaidCategoryId(
  transaction: PlaidTransaction,
) {
  const existingTransaction = await prisma.transaction.findUnique({
    where: {
      plaidTransactionId: transaction.transaction_id,
    },
  });

  if (existingTransaction?.categoryId) {
    return existingTransaction.categoryId;
  }

  const plaidCategory = await findOrCreatePlaidCategory(transaction);

  return plaidCategory?.id ?? null;
}
