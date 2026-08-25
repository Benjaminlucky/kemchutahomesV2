import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { getROISettings } from "@/lib/api";
import Buy2SellPage from "@/components/buy2sell/Buy2SellPage";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export const metadata = buildMetadata({
  title: "Buy2Sell Investment Scheme",
  description:
    "Invest in the Kemchuta Homes Buy2Sell land-bank scheme and earn up to 75% ROI over 6, 12, or 18 months. Capital guaranteed, returns paid at maturity.",
  path: "/buy2sell",
});

export default async function Page() {
  // getROISettings() throws on a non-2xx response — a transient API hiccup
  // used to crash this entire page for every visitor. There's no sensible
  // fallback ROI to fabricate (these are real, changing percentages), so
  // show a plain notice instead of the interactive page rather than guess.
  let roi: Awaited<ReturnType<typeof getROISettings>> | null = null;
  try {
    roi = await getROISettings();
  } catch (err) {
    console.error("Buy2SellPage: failed to load ROI settings:", err);
  }

  if (!roi) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-11/12 max-w-md items-center justify-center py-20">
        <ErrorBanner className="text-center">
          Couldn&rsquo;t load Buy2Sell right now — please refresh.
        </ErrorBanner>
      </div>
    );
  }

  // Buy2SellPage uses useSearchParams() (to read ?duration=/?email= prefill
  // params), which requires a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <Buy2SellPage initialRoi={roi} />
    </Suspense>
  );
}
