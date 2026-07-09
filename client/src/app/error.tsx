"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw, Home } from "lucide-react";
import Sentry from "@/lib/sentryClient";

// Route-segment error boundary (PRD FR-5: "Error boundaries per route
// segment with branded fallbacks"). Next.js requires this to be a Client
// Component and renders it in place of the segment that threw, keeping
// header/footer/announcement bar (declared in the parent layout) mounted.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error boundary caught:", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-11/12 max-w-md flex-col items-center justify-center py-20 text-center">
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "rgba(112,12,235,0.08)" }}
      >
        <RefreshCcw size={28} style={{ color: "#700CEB" }} />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-customBlack-900">
        Something went wrong
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        We hit a snag loading this page. Try again, or head back home — the
        rest of the site is unaffected.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full px-6 py-2.5 text-sm font-bold text-white transition-transform duration-200 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #700CEB, #8A2FF0)",
            boxShadow: "0 4px 14px rgba(112,12,235,0.35)",
          }}
        >
          Try again
        </button>
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
