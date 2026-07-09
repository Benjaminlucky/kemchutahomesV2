// Thin typed wrapper around the Express API. Server Components call these
// directly with Next's fetch cache options (see §4.5/FR-3 of the PRD —
// ISR + on-demand revalidation via tags); client components (e.g.
// AnnouncementBar) hit the API directly since they need session-scoped
// behavior the cache tags don't apply to.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type Estate = {
  _id: string;
  estate: string;
  slug: string;
  address: string;
  location: "Lagos" | "Asaba" | "Anambra" | "Abuja";
  purpose: string;
  title: string;
  price: string;
  sqm: string;
  desc: string;
  category?: string;
  img: string;
  imgPublicId?: string;
  depositPercentage?: string;
  // Typo in the DB schema itself ("sytemap" not "sitemap") — load-bearing,
  // matches the field name the API actually returns.
  sytemap?: string;
  gallery: { url: string; publicId: string; caption?: string }[];
  videos: { videoId: string; title: string; url: string }[];
  amenities: { name: string }[];
  neighborhood: { name: string }[];
  paymentPlan: { plot: string; outright: string; initialDeposit: string }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EstateListResponse = {
  estates: Estate[];
  total: number;
  page: number;
  pages: number;
};

export type GetEstatesParams = {
  location?: string;
  purpose?: string;
  search?: string;
  page?: number;
  limit?: number;
  active?: "true" | "all";
};

/**
 * Estate listings — revalidated every 10 minutes (matches the PRD's
 * §4.3 rendering table for /developments), with an 'estates' cache tag
 * so admin writes can force-refresh via revalidateTag('estates').
 */
export async function getEstates(
  params: GetEstatesParams = {},
): Promise<EstateListResponse> {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) qs.set(key, String(value));
  }

  const res = await fetch(`${API_BASE_URL}/api/estates?${qs.toString()}`, {
    next: { revalidate: 600, tags: ["estates"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch estates: ${res.status}`);
  }
  return res.json();
}

/**
 * Single estate by slug — the core SEO asset. Long revalidate window since
 * admin writes trigger on-demand revalidation via the same 'estates' tag
 * (see PRD §4.4 FR-1/FR-3) rather than relying on the timer.
 */
export async function getEstateBySlug(slug: string): Promise<Estate | null> {
  const res = await fetch(`${API_BASE_URL}/api/estates/slug/${slug}`, {
    next: { revalidate: 3600, tags: ["estates", `estate:${slug}`] },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch estate "${slug}": ${res.status}`);
  }
  return res.json();
}

/**
 * Resolves an old/removed estate slug to where the page should redirect
 * (PRD FR-1: "renamed slugs → 301 redirect map; removed estates → 410 or
 * redirect to /developments"). Returns null when the slug has no history at
 * all — the caller should render a real 404 in that case, not redirect.
 */
export async function getEstateRedirect(
  slug: string,
): Promise<{ target: string } | null> {
  const res = await fetch(`${API_BASE_URL}/api/estates/redirect/${slug}`, {
    next: { revalidate: 3600, tags: ["estates"] },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to resolve estate redirect "${slug}": ${res.status}`);
  }
  return res.json();
}

export type Branch = {
  branchId: string;
  label: string;
  isHQ: boolean;
  address: string;
  mapEmbedUrl: string;
  mapLink: string;
  phones: string[];
  emails: string[];
  hours: { weekdays: string; saturday: string; sunday: string };
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
    youtube?: string;
  };
  isActive: boolean;
};

/**
 * Branch offices — fetched server-side (unlike the legacy client-fetch
 * pattern) so LocalBusiness JSON-LD can be built from real data at render
 * time instead of only appearing after client-side hydration.
 */
export async function getBranches(): Promise<Branch[]> {
  const res = await fetch(`${API_BASE_URL}/api/branches`, {
    next: { revalidate: 3600, tags: ["branches"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch branches: ${res.status}`);
  }
  const data = await res.json();
  return (Array.isArray(data) ? data : []).filter(
    (b: Branch) => b.isActive !== false,
  );
}

export type ROISettings = {
  roiPercent6Months: number;
  roiPercent12Months: number;
  roiPercent18Months: number;
  minInvestment?: number;
  maxInvestment?: number;
};

/**
 * Buy2Sell ROI rates — fetched server-side so the hero's ROI pills render
 * real numbers in the initial HTML instead of only after client fetch.
 */
export async function getROISettings(): Promise<ROISettings> {
  const res = await fetch(`${API_BASE_URL}/api/buy2sell/roi`, {
    next: { revalidate: 3600, tags: ["roi-settings"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ROI settings: ${res.status}`);
  }
  return res.json();
}

export type Faq = {
  _id: string;
  question: string;
  answer: string;
  category:
    | "General"
    | "Subscription"
    | "Buy2Sell"
    | "Inspection"
    | "Documents"
    | "Payment";
  active?: boolean;
};

export type KnowledgeBase = {
  faqs: Faq[];
  companyInfo: {
    lagosPhone: string;
    asabaPhone: string;
    whatsappNumber: string;
    email: string;
    lagosAddress: string;
    asabaAddress: string;
    workingHours: string;
    instagramHandle: string;
  };
  notices: { _id: string; text: string; active?: boolean }[];
};

/**
 * FAQ + company info + notices singleton — powers /faq (FAQPage JSON-LD,
 * PRD FR-1), invalidated via the 'knowledge-base' tag on admin writes.
 */
export async function getKnowledgeBase(): Promise<KnowledgeBase> {
  const res = await fetch(`${API_BASE_URL}/api/knowledge-base`, {
    next: { revalidate: 3600, tags: ["knowledge-base"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch knowledge base: ${res.status}`);
  }
  return res.json();
}
