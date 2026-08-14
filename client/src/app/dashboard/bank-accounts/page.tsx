import { cookies } from "next/headers";
import BankAccountsPanel from "@/components/dashboard/bank-accounts/BankAccountsPanel";
import type { BankAccount } from "@/components/dashboard/bank-accounts/types";
import { requireAdminAccess } from "@/lib/requireAdminAccess";

export default async function ManageBankAccountsPage() {
  await requireAdminAccess("bank_accounts");
  const cookieHeader = (await cookies()).toString();
  let initial: BankAccount[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bank-accounts`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) initial = await res.json();
  } catch {
    initial = [];
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-customBlack-900">Bank Accounts</h1>
      <BankAccountsPanel initial={initial} />
    </div>
  );
}
