"use client";

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

export function textInputClass(hasError?: string | boolean) {
  return `w-full rounded-lg border px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:ring-2 focus:ring-customPurple-500 ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
  }`;
}

export function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-base font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-70"
      style={{
        background: loading ? "rgba(112,12,235,0.6)" : "linear-gradient(135deg, #700CEB, #8A2FF0)",
        boxShadow: loading ? "none" : "0 8px 24px rgba(112,12,235,0.35)",
      }}
    >
      {loading ? (
        <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
