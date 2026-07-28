"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function DownloadDocumentButton({
  subscriptionId,
  docType,
  label,
  referenceNumber,
}: {
  subscriptionId: string;
  docType: string;
  label: string;
  referenceNumber: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscriptions/${subscriptionId}/documents/${docType}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Download failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${label.replace(/\s+/g, "-")}-${referenceNumber || subscriptionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-customPurple-200 bg-customPurple-50 px-3.5 py-2 text-xs font-bold text-customPurple-700 transition-colors hover:bg-customPurple-100 disabled:opacity-60"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        Download
      </button>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
