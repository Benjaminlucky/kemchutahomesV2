"use client";

import { usePathname } from "next/navigation";
import AnnouncementBar from "@/components/announcements/AnnouncementBar";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { isPortalRoute } from "@/lib/routeVisibility";

// AnnouncementBar, Header, and Footer are already Client Components (none of
// them do server-side data fetching that would regress by moving the
// show/hide decision to the client — AnnouncementBar already client-fetches
// its own data), so gating them here on the current path is a pure
// visibility concern with no SSR/SEO tradeoff, unlike e.g. the Hero carousel.
// /dashboard/* and /client/portal/* render their own full-page shells
// (DashboardShell, the portal's own header) and must not get the public
// marketing chrome wrapped around them too — this was a known, longstanding
// gap (see the removed TODO this file replaces).
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = isPortalRoute(pathname);

  return (
    <>
      {!isPortal && <AnnouncementBar />}
      {!isPortal && <Header />}
      <main className="flex-1">{children}</main>
      {!isPortal && <Footer />}
    </>
  );
}
