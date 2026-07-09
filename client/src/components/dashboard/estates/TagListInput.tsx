"use client";

import { useState } from "react";
import { X } from "lucide-react";

// Small add/remove chip input for amenities/neighborhood — both are stored
// server-side as [{ name: string }], so this works directly with a plain
// string[] and the parent converts to that shape on submit.
export default function TagListInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setDraft("");
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-customPurple-500"
        />
        <button
          type="button"
          onClick={addTag}
          className="rounded-lg bg-customPurple-50 px-4 py-2.5 text-sm font-bold text-customPurple-600 hover:bg-customPurple-100"
        >
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-customPurple-50 px-3 py-1.5 text-xs font-semibold text-customPurple-700"
            >
              {tag}
              <button type="button" onClick={() => onChange(values.filter((v) => v !== tag))} aria-label={`Remove ${tag}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
