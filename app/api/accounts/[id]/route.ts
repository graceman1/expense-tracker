import { getAccount } from "@/lib/accounts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const account = await getAccount(id);

  if (!account) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  return Response.json(account);
}
