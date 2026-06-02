import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();

  const account = await prisma.account.create({
    data: {
      name: "Everyday Checking",
      institution: "Sandbox Bank",
      type: "checking",
      balance: 2480.75,
    },
  });

  const groceries = await prisma.category.create({
    data: {
      name: "Groceries",
      color: "#16a34a",
    },
  });

  const dining = await prisma.category.create({
    data: {
      name: "Dining",
      color: "#f97316",
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        accountId: account.id,
        categoryId: groceries.id,
        name: "Whole Foods",
        amount: 84.21,
        date: new Date("2026-05-28"),
      },
      {
        accountId: account.id,
        categoryId: dining.id,
        name: "Chipotle",
        amount: 17.64,
        date: new Date("2026-05-29"),
      },
      {
        accountId: account.id,
        name: "Paycheck",
        amount: -2200,
        date: new Date("2026-05-30"),
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
