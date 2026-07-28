"use client";

import dynamic from "next/dynamic";

// Reviews is decorative, below-the-fold social proof that takes no props and
// isn't primary indexable content — so we defer it fully client-side
// (`ssr: false`). `ssr: false` can't be set from the Server Component in
// page.tsx, so this tiny Client wrapper owns the dynamic import: Swiper's JS
// (plus Reviews' own code) never ships in the homepage's initial bundle and
// only loads once this hydrates. The placeholder reserves vertical space to
// avoid the footer jumping when the real content mounts.
const Reviews = dynamic(() => import("./Reviews"), {
  ssr: false,
  loading: () => <div aria-hidden style={{ background: "#ffffff", minHeight: 720 }} />,
});

export default function ReviewsClient() {
  return <Reviews />;
}
