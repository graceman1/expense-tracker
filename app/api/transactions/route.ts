import {
  createTransaction,
  deleteTransaction,
  getTransactionId,
  parseTransactionPayload,
  type TransactionPayload,
  updateTransaction,
} from "@/lib/transactions";

export async function POST(request: Request) {
  const body = (await request.json()) as TransactionPayload;
  const input = parseTransactionPayload(body);

  if (!input) {
    return Response.json({ error: "Invalid transaction" }, { status: 400 });
  }

  const transaction = await createTransaction(input);

  return Response.json(transaction, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as TransactionPayload & { id?: unknown };
  const id = getTransactionId(body);
  const input = parseTransactionPayload(body);

  if (!id || !input) {
    return Response.json({ error: "Invalid transaction" }, { status: 400 });
  }

  const transaction = await updateTransaction(id, input);

  return Response.json(transaction);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Missing transaction id" }, { status: 400 });
  }

  await deleteTransaction(id);

  return new Response(null, { status: 204 });
}
