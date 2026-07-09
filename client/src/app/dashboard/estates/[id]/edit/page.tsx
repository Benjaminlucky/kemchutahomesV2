import { notFound } from "next/navigation";
import EstateForm from "@/components/dashboard/estates/EstateForm";
import type { Estate } from "@/lib/api";

export default async function EditEstatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // GET /api/estates/id/:id is a public read endpoint — no cookie needed.
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/estates/id/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) notFound();
  const estate: Estate = await res.json();

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-customBlack-900">Edit Estate</h1>
      <EstateForm estate={estate} />
    </div>
  );
}
