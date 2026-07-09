// Global route-level loading skeleton (PRD FR-5). Next.js shows this
// automatically while a segment's server data is being fetched, via
// React Suspense — no manual loading state wiring needed per page.
export default function Loading() {
  return (
    <div className="mx-auto w-11/12 max-w-5xl animate-pulse py-16 lg:w-10/12">
      <div className="mb-4 h-8 w-2/3 rounded-lg bg-customBlack-100" />
      <div className="mb-10 h-4 w-1/3 rounded-lg bg-customBlack-100" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-customBlack-100">
            <div className="h-44 w-full bg-customBlack-100" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 rounded bg-customBlack-100" />
              <div className="h-3 w-1/2 rounded bg-customBlack-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
