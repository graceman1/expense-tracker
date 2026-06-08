import { syncPlaidSandboxItem } from "@/lib/plaid-sync";

export async function POST() {
  const result = await syncPlaidSandboxItem();

  return Response.json(result);
}
