import { buildMetadata } from "@/lib/seo";
import { getEstates, type EstateListResponse } from "@/lib/api";
import Hero from "@/components/hero/Hero";
import Homeintro from "@/components/home/Homeintro";
import YoutubeIntro from "@/components/home/YoutubeIntro";
import Homeservices from "@/components/home/Homeservices";
import DevelopingEstate from "@/components/developingestate/DevelopingEstate";
import Whychoose from "@/components/home/Whychoose";
import Earnhome from "@/components/home/Earnhome";
import Homeallocate from "@/components/home/Homeallocate";
import ReviewsClient from "@/components/home/ReviewsClient";

export const metadata = buildMetadata({
  title: "Kemchuta Homes Limited",
  description:
    "Kemchuta Homes Limited — trusted real estate marketing, plot subscriptions, and property investment across Lagos, Asaba, Anambra, and Abuja.",
  path: "/",
});

export default async function Home() {
  // Fetched server-side (not client useEffect) so crawlers and social
  // scrapers see real estate content in the initial HTML — the entire
  // point of this replatform (see PRD headline finding on CSR SEO).
  //
  // Both getEstates() calls throw on a non-2xx response — a transient API
  // hiccup used to crash the entire homepage for every visitor instead of
  // just rendering the estate-dependent sections empty.
  const empty: EstateListResponse = { estates: [], total: 0, page: 1, pages: 0 };
  let heroEstates: EstateListResponse = empty;
  let developingEstates: EstateListResponse = empty;
  try {
    [heroEstates, developingEstates] = await Promise.all([
      getEstates({ limit: 5, active: "true" }),
      getEstates({ limit: 3, active: "true" }),
    ]);
  } catch (err) {
    console.error("Home: failed to load estates:", err);
  }

  return (
    <div className="w-full overflow-x-hidden">
      <Hero estates={heroEstates.estates} />
      <Homeintro />
      <YoutubeIntro />
      <Homeservices />
      <DevelopingEstate estates={developingEstates.estates} />
      <Whychoose />
      <Earnhome />
      <Homeallocate />
      <ReviewsClient />
    </div>
  );
}
