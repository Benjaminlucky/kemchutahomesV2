import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { getROISettings } from "@/lib/api";
import Buy2SellPage from "@/components/buy2sell/Buy2SellPage";

export const metadata = buildMetadata({
  title: "Buy2Sell Investment Scheme",
  description:
    "Invest in the Kemchuta Homes Buy2Sell land-bank scheme and earn up to 75% ROI over 6, 12, or 18 months. Capital guaranteed, returns paid at maturity.",
  path: "/buy2sell",
});

export default async function Page() {
  const roi = await getROISettings();

  // Buy2SellPage uses useSearchParams() (to read ?duration=/?email= prefill
  // params), which requires a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <Buy2SellPage initialRoi={roi} />
    </Suspense>
  );
}
