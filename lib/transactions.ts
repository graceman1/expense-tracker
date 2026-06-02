import { prisma } from "@/lib/prisma";

export type CreateTransactionInput = {
  accountId: string;
  categoryId?: string;
  name: string;
  amount: number;
  date: string;
};

export type UpdateTransactionInput = CreateTransactionInput;

export type TransactionPayload = {
  accountId?: unknown;
  categoryId?: unknown;
  name?: unknown;
  amount?: unknown;
  date?: unknown;
};

export function getTransactionId(body: { id?: unknown }) {
  return typeof body.id === "string" ? body.id : "";
}

export function parseTransactionPayload(body: TransactionPayload) {
  const accountId = typeof body.accountId === "string" ? body.accountId : "";
  const categoryId =
    typeof body.categoryId === "string" ? body.categoryId : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const amount =
    typeof body.amount === "number" ? body.amount : Number(body.amount);
  const date = typeof body.date === "string" ? body.date : "";

  if (!accountId || !name || !Number.isFinite(amount) || !date) {
    return null;
  }

  return {
    accountId,
    categoryId,
    name,
    amount,
    date,
  };
}

export async function createTransaction(input: CreateTransactionInput) {
  return prisma.transaction.create({
    data: {
      accountId: input.accountId,
      categoryId: input.categoryId || undefined,
      name: input.name,
      amount: input.amount,
      date: new Date(`${input.date}T00:00:00.000Z`),
    },
  });
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
) {
  return prisma.transaction.update({
    where: {
      id,
    },
    data: {
      accountId: input.accountId,
      categoryId: input.categoryId || null,
      name: input.name,
      amount: input.amount,
      date: new Date(`${input.date}T00:00:00.000Z`),
    },
  });
}

export async function deleteTransaction(id: string) {
  return prisma.transaction.delete({
    where: {
      id,
    },
  });
}
