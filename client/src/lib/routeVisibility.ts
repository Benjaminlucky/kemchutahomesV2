// Routes that render their own full-page shell (DashboardShell, the client
// portal's own header) and must not also get the public marketing chrome
// (AnnouncementBar, Header, Footer) or the chat widget wrapped around them —
// shared by SiteChrome.tsx and ChatWidgetGate.tsx so the two gates can't
// silently drift out of sync with each other.
export const PORTAL_ROUTE_PREFIXES = ["/dashboard", "/client/portal"] as const;

export function isPortalRoute(pathname: string): boolean {
  return PORTAL_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
