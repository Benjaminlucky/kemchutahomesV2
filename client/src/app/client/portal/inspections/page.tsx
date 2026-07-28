import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import InspectionsSection from "@/components/client-portal/InspectionsSection";
import type { PortalInspectionListResponse } from "@/components/client-portal/types";

export const metadata = buildMetadata({
  title: "My Inspections",
  description: "Your Kemchuta Homes site inspection bookings.",
  path: "/client/portal/inspections",
});

const PAGE_SIZE = 10;

export default async function ClientInspectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status = "", page = "1" } = await searchParams;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const qs = new URLSearchParams({ page, limit: String(PAGE_SIZE) });
  if (status) qs.set("status", status);

  const res = await fetch(`${apiBase}/api/clients/inspections?${qs}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/client/login");
  }

  const data: PortalInspectionListResponse = await res.json();

  return (
    <div className="mx-auto w-11/12 max-w-4xl py-16 lg:w-10/12">
      <InspectionsSection data={data} status={status} page={Number(page)} />
    </div>
  );
}
