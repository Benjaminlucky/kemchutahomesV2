"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { FormField, textInputClass } from "@/components/client-auth/FormField";
import type { CommissionTierSettings } from "./types";

const PERCENT_FIELDS: { key: keyof CommissionTierSettings; label: string }[] = [
  { key: "level1Percent", label: "Level 1 — Direct Sale (%)" },
  { key: "level2Percent", label: "Level 2 — Recruiter Override (%)" },
  { key: "level3Percent", label: "Level 3 — Upline Override (%)" },
  { key: "level4Percent", label: "Level 4 — Top Level (%)" },
  { key: "whtPercent", label: "Withholding Tax — WHT (%)" },
  { key: "clawbackDays", label: "Clawback Window (days)" },
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

  const { data: tiers } = useQuery({
    queryKey: ["commission-tiers"],
    queryFn: fetchTiers,
    initialData: initial ?? undefined,
  });

  if (!dirty && tiers && JSON.stringify(tiers) !== JSON.stringify(form)) {
    setForm(tiers);
  }

  const mutation = useDashboardMutation<unknown, CommissionTierSettings>({
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
    onSuccess: () => {
      setDirty(false);
      setToast("Commission tiers updated");
      queryClient.invalidateQueries({ queryKey: ["commission-tiers"] });
    },
  });

  if (!form) return null;

  return (
    <Card radius="3xl" className="p-6">
      <Toast message={toast} onClose={() => setToast(null)} />
      <h2 className="mb-1 text-xl font-bold text-customBlack-900">Commission Tier Settings</h2>
      <p className="mb-6 text-sm text-customBlack-400">
        Applies to new sales going forward. Commissions already recorded keep the rate that was active when they were
        earned.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PERCENT_FIELDS.map(({ key, label }) => (
          <FormField key={key} label={label}>
            <input
              type="number"
              value={form[key]}
              onChange={(e) => {
                setForm({ ...form, [key]: Number(e.target.value) });
                setDirty(true);
              }}
              className={textInputClass()}
            />
          </FormField>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button loading={mutation.isPending} onClick={() => mutation.mutate(form)}>
          Save Tier Settings
        </Button>
      </div>
    </Card>
  );
}
