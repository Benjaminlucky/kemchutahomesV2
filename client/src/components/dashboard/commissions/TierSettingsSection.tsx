"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField, textInputClass } from "@/components/client-auth/FormField";
import type { CommissionTierSettings } from "./types";

const TIER_FIELDS: { key: keyof CommissionTierSettings; label: string; max: number; suffix: string }[] = [
  { key: "level1Percent", label: "Level 1 — Direct Sale (%)", max: 50, suffix: "%" },
  { key: "level2Percent", label: "Level 2 — Recruiter Override (%)", max: 30, suffix: "%" },
  { key: "level3Percent", label: "Level 3 — Upline Override (%)", max: 20, suffix: "%" },
  { key: "level4Percent", label: "Level 4 — Top Level (%)", max: 15, suffix: "%" },
  { key: "whtPercent", label: "Withholding Tax — WHT (%)", max: 20, suffix: "%" },
  { key: "clawbackDays", label: "Clawback Window (days)", max: 365, suffix: "days" },
];

async function fetchTiers(): Promise<CommissionTierSettings> {
  const res = await dashboardFetch("/api/commissions/tiers");
  if (!res.ok) throw new Error("Failed to fetch tier settings");
  return res.json();
}

export default function TierSettingsSection({ initial }: { initial: CommissionTierSettings | null }) {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState<CommissionTierSettings | null>(initial);
  const [dirty, setDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: tiers, error, refetch, isRefetching } = useQuery({
    queryKey: ["commission-tiers"],
    queryFn: fetchTiers,
    initialData: initial ?? undefined,
  });

  // "Adjusting state when a prop changes" — React's own sanctioned pattern
  // (react.dev/learn/you-might-not-need-an-effect) is a conditional setState
  // during render, not inside useEffect: an effect runs a commit after the
  // tiers-driven render, and setState there triggers a second cascading
  // render for what should be a single update. Tracking "last seen tiers" in
  // state (not a ref — refs can't be read/written during render either) is
  // what makes this safe to call on every render without looping.
  const [prevTiers, setPrevTiers] = useState(tiers);
  if (tiers && tiers !== prevTiers) {
    setPrevTiers(tiers);
    if (!dirty) setForm(tiers);
  }

  const mutation = useDashboardMutation<{ tiers: CommissionTierSettings }, CommissionTierSettings>({
    mutationFn: async (body) => {
      const res = await dashboardFetch("/api/commissions/tiers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update tier settings");
      return data;
    },
    onSuccess: (data) => {
      // Seed the cache with the server's own authoritative response instead
      // of just invalidating — invalidate alone left a window where dirty
      // was already cleared but the refetch hadn't landed yet, so the form
      // visibly flashed back to the pre-save values before snapping forward.
      queryClient.setQueryData(["commission-tiers"], data.tiers);
      setPrevTiers(data.tiers);
      setForm(data.tiers);
      setDirty(false);
      setConfirmOpen(false);
      setSaveError(null);
      setToast("Commission tiers updated");
    },
    onError: (err) => {
      setSaveError(err instanceof Error ? err.message : "Failed to update tier settings");
      setConfirmOpen(false);
    },
  });

  if (error) {
    return (
      <Card radius="3xl" className="p-6">
        <ErrorBanner className="mb-4">{error instanceof Error ? error.message : "Failed to load tier settings"}</ErrorBanner>
        <Button variant="secondary" size="sm" loading={isRefetching} onClick={() => refetch()}>
          Retry
        </Button>
      </Card>
    );
  }

  if (!form) {
    return (
      <Card radius="3xl" className="p-6">
        <p className="text-sm text-customBlack-400">Loading tier settings…</p>
      </Card>
    );
  }

  return (
    <Card radius="3xl" className="p-6">
      <Toast message={toast} onClose={() => setToast(null)} />
      <h2 className="mb-1 text-xl font-bold text-customBlack-900">Commission Tier Settings</h2>
      <p className="mb-6 text-sm text-customBlack-400">
        Applies to new sales going forward, across both Lands and Buy2Sell commissions. Commissions already recorded
        keep the rate that was active when they were earned.
      </p>
      {saveError && <ErrorBanner className="mb-4">{saveError}</ErrorBanner>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {TIER_FIELDS.map(({ key, label, max, suffix }) => (
          <FormField key={key} label={`${label} — up to ${max}${suffix === "%" ? "%" : ` ${suffix}`}`}>
            <input
              type="number"
              min={0}
              max={max}
              step={1}
              value={form[key]}
              onChange={(e) => {
                const raw = e.target.value;
                setForm({ ...form, [key]: raw === "" ? 0 : Number(raw) });
                setDirty(true);
              }}
              className={textInputClass()}
            />
          </FormField>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button disabled={!dirty} onClick={() => setConfirmOpen(true)}>
          Save Tier Settings
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => mutation.mutate(form)}
        title="Update Commission Tiers?"
        description="This changes the payout rate for every future Lands and Buy2Sell sale across the entire realtor network, effective immediately. Commissions already recorded are not affected."
        confirmLabel="Save Changes"
        danger={false}
        loading={mutation.isPending}
      />
    </Card>
  );
}
