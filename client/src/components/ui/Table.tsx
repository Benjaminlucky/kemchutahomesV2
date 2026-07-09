import { cn } from "@/lib/utils";

// Extracted from the byte-identical shell/header/empty-row markup that
// EstatesTable and InspectionsTable each hand-rolled — row/cell content
// still varies too much per table to be worth abstracting further.

export function TableShell({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-customBlack-100 bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">{children}</table>
      </div>
    </div>
  );
}

export function TableHeadRow({ headers }: { headers: string[] }) {
  return (
    <thead>
      <tr className="bg-customBlack-50/50">
        {headers.map((h) => (
          <th key={h} className="px-6 py-4 text-xs font-bold tracking-widest text-customBlack-400 uppercase">
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-customBlack-50">{children}</tbody>;
}

export function TableEmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-16 text-center text-sm text-gray-400">
        {message}
      </td>
    </tr>
  );
}
