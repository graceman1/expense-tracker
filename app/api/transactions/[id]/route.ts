import {
  deleteTransaction,
  parseTransactionPayload,
  type TransactionPayload,
  updateTransaction,
} from "@/lib/transactions";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as TransactionPayload;
  const input = parseTransactionPayload(body);

  if (!input) {
    return Response.json({ error: "Invalid transaction" }, { status: 400 });
  }

  const transaction = await updateTransaction(id, input);

  return Response.json(transaction);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deleteTransaction(id);

  return new Response(null, { status: 204 });
}
