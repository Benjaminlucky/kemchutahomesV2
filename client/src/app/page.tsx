import { buildMetadata } from "@/lib/seo";
import { getEstates } from "@/lib/api";
import Hero from "@/components/hero/Hero";
import Homeintro from "@/components/home/Homeintro";
import YoutubeIntro from "@/components/home/YoutubeIntro";
import Homeservices from "@/components/home/Homeservices";
import DevelopingEstate from "@/components/developingestate/DevelopingEstate";
import Whychoose from "@/components/home/Whychoose";
import Earnhome from "@/components/home/Earnhome";
import Homeallocate from "@/components/home/Homeallocate";
import Reviews from "@/components/home/Reviews";

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
  const [heroEstates, developingEstates] = await Promise.all([
    getEstates({ limit: 5, active: "true" }),
    getEstates({ limit: 3, active: "true" }),
  ]);

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
      <Reviews />
    </div>
  );
}
