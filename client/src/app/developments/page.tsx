import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { getEstates } from "@/lib/api";
import SearchBar from "@/components/searchbar/SearchBar";
import Development from "@/components/developments/Development";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export const metadata = buildMetadata({
  title: "Developments",
  description:
    "Explore Kemchuta Homes Limited's rapidly growing estate projects — diverse titles, prime locations, and competitive pricing across Lagos, Asaba, Anambra, and Abuja.",
  path: "/developments",
});

export default async function DevelopmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; location?: string; purpose?: string }>;
}) {
  const params = await searchParams;

  // getEstates() throws on a non-2xx response — a transient API hiccup
  // used to crash this entire listings page for every visitor instead of
  // just showing an inline notice.
  let estates: Awaited<ReturnType<typeof getEstates>>["estates"] = [];
  let loadError = false;
  try {
    ({ estates } = await getEstates({
      limit: 50,
      active: "true",
      ...(params.search?.trim() && { search: params.search.trim() }),
      ...(params.location && params.location !== "Choose Location" && { location: params.location }),
      ...(params.purpose && params.purpose !== "Any Purpose" && { purpose: params.purpose }),
    }));
  } catch (err) {
    console.error("DevelopmentsPage: failed to load estates:", err);
    loadError = true;
  }

  return (
    <main className="w-full">
      {/* SearchBar reads useSearchParams(), which requires a Suspense boundary */}
      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>

      <div className="mx-auto mt-8 w-10/12 md:mt-16">
        <div className="py-4 md:py-16">
          <div className="mx-auto w-full text-center md:w-3/5">
            <h3 className="text-xl leading-[1.2] font-bold tracking-tight md:text-5xl md:tracking-tighter">
              Explore Our Rapidly Growing Estate Projects{" "}
              <span className="text-customPurple-500">Diverse Titles, Prime Locations, and Competitive Pricing.</span>
            </h3>
          </div>

          <div className="mx-auto mt-4 w-full text-center text-sm md:mt-8 md:w-3/5 md:text-lg">
            <p>
              Discover a range of premium estate developments tailored to meet
              your investment and homeownership dreams. From strategically
              located properties to flexible pricing options, our projects
              are designed for value, growth, and sustainability.
            </p>
          </div>

          <section>
            {loadError ? (
              <ErrorBanner className="mx-auto max-w-md text-center">
                Couldn&rsquo;t load listings right now — please refresh.
              </ErrorBanner>
            ) : (
              <Development estates={estates} />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
