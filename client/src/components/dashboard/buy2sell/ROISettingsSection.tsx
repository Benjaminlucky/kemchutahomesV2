"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { FormField, textInputClass } from "@/components/client-auth/FormField";
import type { ROISettings } from "./types";

const NUMERIC_FIELDS: { key: keyof ROISettings; label: string }[] = [
  { key: "roiPercent6Months", label: "6 Months ROI (%)" },
  { key: "roiPercent12Months", label: "12 Months ROI (%)" },
  { key: "roiPercent18Months", label: "18 Months ROI (%)" },
  { key: "minInvestment", label: "Minimum Investment (₦)" },
  { key: "maxInvestment", label: "Maximum Investment (₦)" },
];

async function fetchRoi(): Promise<ROISettings> {
  const res = await dashboardFetch("/api/buy2sell/roi");
  if (!res.ok) throw new Error("Failed to fetch ROI settings");
  return res.json();
}

export default function ROISettingsSection({ initial }: { initial: ROISettings | null }) {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState<ROISettings | null>(initial);
  const [dirty, setDirty] = useState(false);

  const { data: roi } = useQuery({
    queryKey: ["buy2sell-roi"],
    queryFn: fetchRoi,
    initialData: initial ?? undefined,
  });

  if (!dirty && roi && JSON.stringify(roi) !== JSON.stringify(form)) {
    setForm(roi);
  }

  const mutation = useDashboardMutation<unknown, ROISettings>({
    mutationFn: async (body) => {
      const res = await dashboardFetch("/api/buy2sell/roi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update ROI settings");
      return data;
    },
    onSuccess: () => {
      setDirty(false);
      setToast("ROI settings updated");
      queryClient.invalidateQueries({ queryKey: ["buy2sell-roi"] });
    },
  });

  if (!form) return null;

  return (
    <Card radius="3xl" className="p-6">
      <Toast message={toast} onClose={() => setToast(null)} />
      <h2 className="mb-6 text-xl font-bold text-customBlack-900">ROI Rate Settings</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {NUMERIC_FIELDS.map(({ key, label }) => (
          <FormField key={key} label={label}>
            <input
              type="number"
              value={form[key]}
              onChange={(e) => { setForm({ ...form, [key]: Number(e.target.value) }); setDirty(true); }}
              className={textInputClass()}
            />
          </FormField>
        ))}
      </div>
      <FormField label="Description (optional)">
        <textarea
          value={form.description}
          onChange={(e) => { setForm({ ...form, description: e.target.value }); setDirty(true); }}
          rows={3}
          className={textInputClass()}
        />
      </FormField>
      <div className="mt-6 flex justify-end">
        <Button loading={mutation.isPending} onClick={() => mutation.mutate(form)}>Save ROI Rates</Button>
      </div>
    </Card>
  );
}
