import { dashboardFetch } from "./dashboardFetch";

// Document endpoints (subscriptions/:id/documents/:docType,
// buy2sell/leads/:id/documents/:docType) return a raw PDF behind cookie
// auth, not JSON — a plain <a href> would cross an origin boundary (API is
// on a different host than the Next app) with no guaranteed cookie
// delivery, so this fetches as a blob (dashboardFetch already sends
// credentials) and triggers the save via a throwaway object URL.
export async function downloadDocument(path: string, filename: string) {
  const res = await dashboardFetch(path);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to generate document");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
