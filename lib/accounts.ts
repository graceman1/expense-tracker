import { prisma } from "@/lib/prisma";

export async function getAccount(id: string) {
  return prisma.account.findUnique({
    where: {
      id,
    },
    include: {
      transactions: {
        include: {
          category: true,
        },
        orderBy: {
          date: "desc",
        },
      },
    },
  });
}
