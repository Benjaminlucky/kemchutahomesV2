import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-customBlack-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-customPurple-50">
        <Icon size={22} className="text-customPurple-600" />
      </div>
      <div>
        <p className="mb-1 text-xs font-bold tracking-widest text-customBlack-400 uppercase">{label}</p>
        <p className="text-3xl font-black text-customBlack-900">{value}</p>
        {subtext && <p className="mt-1 text-xs text-customBlack-400">{subtext}</p>}
      </div>
    </div>
  );
}
