import { Products, type Transaction as PlaidTransaction } from "plaid";
import { plaidClient } from "@/lib/plaid";
import { prisma } from "@/lib/prisma";

const sandboxInstitutionId = "ins_109508";
const categoryColors = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#be123c",
  "#4f46e5",
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

async function createPlaidSandboxItem() {
  const publicTokenResponse = await plaidClient.sandboxPublicTokenCreate({
    institution_id: sandboxInstitutionId,
    initial_products: [Products.Transactions],
    options: {
      override_username: "user_good",
      override_password: "pass_good",
    },
  });

  const exchangeResponse = await plaidClient.itemPublicTokenExchange({
    public_token: publicTokenResponse.data.public_token,
  });

  const accessToken = exchangeResponse.data.access_token;
  const itemId = exchangeResponse.data.item_id;

  return prisma.plaidItem.upsert({
    where: {
      itemId,
    },
    create: {
      itemId,
      accessToken,
    },
    update: {
      accessToken,
    },
  });
}

export async function syncPlaidSandboxItem() {
  let plaidItem =
    (await prisma.plaidItem.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    })) ?? (await createPlaidSandboxItem());

  const accessToken = plaidItem.accessToken;
  const itemId = plaidItem.itemId;
  const itemResponse = await plaidClient.itemGet({
    access_token: accessToken,
  });
  const institutionName =
    itemResponse.data.item.institution_name ??
    itemResponse.data.item.institution_id ??
    sandboxInstitutionId;
  let cursor = plaidItem.cursor ?? undefined;
  let addedCount = 0;
  let modifiedCount = 0;
  let removedCount = 0;
  let hasMore = true;

  while (hasMore) {
    const syncResponse = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor,
      options: {
        include_personal_finance_category: true,
      },
    });

    for (const account of syncResponse.data.accounts) {
      await prisma.account.upsert({
        where: {
          plaidAccountId: account.account_id,
        },
        create: {
          plaidAccountId: account.account_id,
          name: account.name,
          institution: institutionName,
          type: account.subtype ?? account.type,
          balance: account.balances.current ?? account.balances.available,
        },
        update: {
          name: account.name,
          institution: institutionName,
          type: account.subtype ?? account.type,
          balance: account.balances.current ?? account.balances.available,
        },
      });
    }

    for (const transaction of [
      ...syncResponse.data.added,
      ...syncResponse.data.modified,
    ]) {
      const account = await prisma.account.findUnique({
        where: {
          plaidAccountId: transaction.account_id,
        },
      });

      if (!account) {
        continue;
      }

      const plaidCategory = await findOrCreatePlaidCategory(transaction);
      const existingTransaction = await prisma.transaction.findUnique({
        where: {
          plaidTransactionId: transaction.transaction_id,
        },
      });
      const categoryId =
        existingTransaction?.categoryId ?? plaidCategory?.id ?? null;

      await prisma.transaction.upsert({
        where: {
          plaidTransactionId: transaction.transaction_id,
        },
        create: {
          plaidTransactionId: transaction.transaction_id,
          accountId: account.id,
          name: transaction.merchant_name ?? transaction.name,
          amount: transaction.amount,
          date: new Date(`${transaction.date}T00:00:00.000Z`),
          pending: transaction.pending,
          categoryId,
        },
        update: {
          accountId: account.id,
          name: transaction.merchant_name ?? transaction.name,
          amount: transaction.amount,
          date: new Date(`${transaction.date}T00:00:00.000Z`),
          pending: transaction.pending,
          categoryId,
        },
      });
    }

    for (const transaction of syncResponse.data.removed) {
      await prisma.transaction.deleteMany({
        where: {
          plaidTransactionId: transaction.transaction_id,
        },
      });
    }

    addedCount += syncResponse.data.added.length;
    modifiedCount += syncResponse.data.modified.length;
    removedCount += syncResponse.data.removed.length;
    cursor = syncResponse.data.next_cursor;
    hasMore = syncResponse.data.has_more;
  }

  plaidItem = await prisma.plaidItem.update({
    where: {
      itemId,
    },
    data: {
      cursor,
    },
  });

  return {
    itemId: plaidItem.itemId,
    cursor: plaidItem.cursor,
    addedCount,
    modifiedCount,
    removedCount,
  };
}
