import Link from "next/link";
import { Search, Home } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

// Global not-found page (PRD FR-5 + FR-1: unknown URLs must return a real
// 404, not a soft-200 shell). Next.js renders this for any route that calls
// notFound() or has no matching segment, and it automatically responds with
// HTTP 404.
export const metadata = buildMetadata({
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or has moved.",
  path: "/404",
});

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-11/12 max-w-md flex-col items-center justify-center py-20 text-center">
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "rgba(112,12,235,0.08)" }}
      >
        <Search size={28} style={{ color: "#700CEB" }} />
      </div>
      <p className="mb-1 text-sm font-bold tracking-widest text-customPurple-500 uppercase">
        404
      </p>
      <h1 className="mb-2 text-2xl font-bold text-customBlack-900">
        We couldn&rsquo;t find that page
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        The estate listing or page you&rsquo;re after may have moved or no
        longer exists. Browse our current developments instead.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/developments"
          className="rounded-full px-6 py-2.5 text-sm font-bold text-white transition-transform duration-200 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #700CEB, #8A2FF0)",
            boxShadow: "0 4px 14px rgba(112,12,235,0.35)",
          }}
        >
          View developments
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-full border-2 px-6 py-2.5 text-sm font-semibold text-customPurple-500 transition-colors duration-200"
          style={{ borderColor: "rgba(112,12,235,0.35)" }}
        >
          <Home size={15} />
          Back home
        </Link>
      </div>
    </div>
  );
}
