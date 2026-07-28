"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { isPortalRoute } from "@/lib/routeVisibility";

// The chat widget is decorative, interactive-only chrome with zero SEO value,
// so it's dynamically imported with `ssr: false` — its JS (framer-motion
// timers, Web Audio chime, message formatting) never ships in any page's
// initial bundle and only loads once this hydrates. `ssr: false` can't be set
// from a Server Component (layout.tsx), so this tiny Client wrapper owns the
// dynamic import (same pattern as ReviewsClient.tsx).
const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

type CompanyInfo = {
  whatsappNumber: string;
  lagosPhone: string;
};

export default function ChatWidgetGate({ companyInfo }: { companyInfo: CompanyInfo }) {
  const pathname = usePathname();
  if (isPortalRoute(pathname)) return null;
  return <ChatWidget companyInfo={companyInfo} />;
}
