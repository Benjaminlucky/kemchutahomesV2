import KnowledgeBasePanel from "@/components/dashboard/knowledge-base/KnowledgeBasePanel";
import type { KnowledgeBase } from "@/components/dashboard/knowledge-base/types";

// GET /api/knowledge-base is a public endpoint (the chatbot reads it at
// runtime too), so no cookie forwarding is needed here — unlike most other
// dashboard pages in this app.
export default async function ManageKnowledgeBasePage() {
  let initial: KnowledgeBase | null = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/knowledge-base`, { cache: "no-store" });
    if (res.ok) initial = await res.json();
  } catch {
    initial = null;
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-customBlack-900">AI Knowledge Base</h1>
      <KnowledgeBasePanel initial={initial} />
    </div>
  );
}
