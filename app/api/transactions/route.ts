import {
  createTransaction,
  getTransactions,
  parseTransactionPayload,
  type TransactionPayload,
} from "@/lib/transactions";

export async function GET() {
  return Response.json(await getTransactions());
}

export async function POST(request: Request) {
  const body = (await request.json()) as TransactionPayload;
  const input = parseTransactionPayload(body);

  if (!input) {
    return Response.json({ error: "Invalid transaction" }, { status: 400 });
  }

  const transaction = await createTransaction(input);

  return Response.json(transaction, { status: 201 });
}
