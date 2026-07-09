"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Upload } from "lucide-react";
import { FormField, textInputClass, SubmitButton } from "@/components/client-auth/FormField";
import TagListInput from "./TagListInput";
import PaymentPlanInput, { type PaymentPlanRow } from "./PaymentPlanInput";
import { dashboardFetch } from "@/lib/dashboardFetch";
import type { Estate } from "@/lib/api";

const LOCATIONS = ["Lagos", "Asaba", "Anambra", "Abuja"] as const;
const PURPOSES = ["Residential", "Commercial", "Investment"] as const;
const TITLES = ["CofO", "Gazette", "Excision", "Freehold", "Registered survey", "CofO in-view"] as const;
const CATEGORIES = ["Land", "House", "Duplex", "Flat", "Commercial"] as const;

const selectClass = "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-customPurple-500";

export default function EstateForm({ estate }: { estate?: Estate }) {
  const router = useRouter();
  const isEdit = Boolean(estate);

  const [fields, setFields] = useState({
    estate: estate?.estate ?? "",
    address: estate?.address ?? "",
    location: estate?.location ?? LOCATIONS[0],
    purpose: estate?.purpose ?? PURPOSES[0],
    title: estate?.title ?? TITLES[0],
    price: estate?.price ?? "",
    sqm: estate?.sqm ?? "",
    desc: estate?.desc ?? "",
    category: estate?.category ?? "",
    depositPercentage: estate?.depositPercentage ?? "",
  });
  const [amenities, setAmenities] = useState((estate?.amenities ?? []).map((a) => a.name));
  const [neighborhood, setNeighborhood] = useState((estate?.neighborhood ?? []).map((n) => n.name));
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlanRow[]>(estate?.paymentPlan ?? []);
  const [videoUrls, setVideoUrls] = useState((estate?.videos ?? []).map((v) => v.url).join("\n"));

  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [keptGallery, setKeptGallery] = useState(estate?.gallery ?? []);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [removingPublicId, setRemovingPublicId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function removeExistingGalleryImage(publicId: string) {
    if (!estate) return; // shouldn't happen — only rendered for existing estates
    setRemovingPublicId(publicId);
    try {
      const res = await dashboardFetch(`/api/estates/${estate._id}/gallery/${encodeURIComponent(publicId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to remove image");
      setKeptGallery((prev) => prev.filter((g) => g.publicId !== publicId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove image");
    } finally {
      setRemovingPublicId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEdit && !featuredFile) {
      setError("A featured image is required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...fields,
        category: fields.category || undefined,
        depositPercentage: fields.depositPercentage || undefined,
        amenities: amenities.map((name) => ({ name })),
        neighborhood: neighborhood.map((name) => ({ name })),
        paymentPlan,
        videos: videoUrls.split("\n").map((v) => v.trim()).filter(Boolean),
        ...(isEdit && { gallery: keptGallery }),
      };

      const formData = new FormData();
      formData.set("data", JSON.stringify(payload));
      if (featuredFile) formData.set("img", featuredFile);
      for (const file of newGalleryFiles) formData.append("gallery", file);

      const res = await dashboardFetch(isEdit ? `/api/estates/${estate!._id}` : "/api/estates", {
        method: isEdit ? "PUT" : "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save estate.");

      router.push("/dashboard/estates");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save estate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

      <section className="space-y-5 rounded-2xl border border-customBlack-100 bg-white p-6">
        <h2 className="text-lg font-bold text-customBlack-900">Basic details</h2>

        <FormField label="Estate name">
          <input
            required
            value={fields.estate}
            onChange={(e) => setFields({ ...fields, estate: e.target.value })}
            className={textInputClass()}
          />
        </FormField>

        <FormField label="Address">
          <input
            required
            value={fields.address}
            onChange={(e) => setFields({ ...fields, address: e.target.value })}
            className={textInputClass()}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Location">
            <select value={fields.location} onChange={(e) => setFields({ ...fields, location: e.target.value as typeof fields.location })} className={selectClass}>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </FormField>
          <FormField label="Purpose">
            <select value={fields.purpose} onChange={(e) => setFields({ ...fields, purpose: e.target.value as typeof fields.purpose })} className={selectClass}>
              {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </FormField>
          <FormField label="Title">
            <select value={fields.title} onChange={(e) => setFields({ ...fields, title: e.target.value as typeof fields.title })} className={selectClass}>
              {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Price">
            <input
              required
              value={fields.price}
              onChange={(e) => setFields({ ...fields, price: e.target.value })}
              placeholder="e.g. 5,000,000"
              className={textInputClass()}
            />
          </FormField>
          <FormField label="Size">
            <input
              required
              value={fields.sqm}
              onChange={(e) => setFields({ ...fields, sqm: e.target.value })}
              placeholder="e.g. 500sqm"
              className={textInputClass()}
            />
          </FormField>
          <FormField label="Category (optional)">
            <select value={fields.category} onChange={(e) => setFields({ ...fields, category: e.target.value })} className={selectClass}>
              <option value="">—</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="Deposit percentage (optional)">
          <input
            value={fields.depositPercentage}
            onChange={(e) => setFields({ ...fields, depositPercentage: e.target.value })}
            placeholder="e.g. 30%"
            className={textInputClass()}
          />
        </FormField>

        <FormField label="Description">
          <textarea
            required
            rows={5}
            value={fields.desc}
            onChange={(e) => setFields({ ...fields, desc: e.target.value })}
            className={textInputClass()}
          />
        </FormField>
      </section>

      <section className="space-y-5 rounded-2xl border border-customBlack-100 bg-white p-6">
        <h2 className="text-lg font-bold text-customBlack-900">Images</h2>

        <FormField label={`Featured image${isEdit ? " (leave blank to keep current)" : ""}`}>
          <div className="flex items-center gap-4">
            {estate?.img && !featuredFile && (
              <Image src={estate.img} alt="Current featured" width={80} height={60} className="rounded-lg object-cover" />
            )}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-customPurple-400">
              <Upload size={16} />
              {featuredFile ? featuredFile.name : "Choose file"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFeaturedFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </FormField>

        {isEdit && keptGallery.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Current gallery</p>
            <div className="flex flex-wrap gap-3">
              {keptGallery.map((img) => (
                <div key={img.publicId} className="relative">
                  <Image src={img.url} alt="" width={90} height={70} className="rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingGalleryImage(img.publicId)}
                    disabled={removingPublicId === img.publicId}
                    aria-label="Remove image"
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white disabled:opacity-50"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <FormField label="Add gallery images (up to 15)">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-customPurple-400">
            <Upload size={16} />
            {newGalleryFiles.length > 0 ? `${newGalleryFiles.length} file(s) selected` : "Choose files"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setNewGalleryFiles(Array.from(e.target.files ?? []))}
            />
          </label>
        </FormField>
      </section>

      <section className="space-y-5 rounded-2xl border border-customBlack-100 bg-white p-6">
        <h2 className="text-lg font-bold text-customBlack-900">More details</h2>

        <TagListInput label="Amenities" values={amenities} onChange={setAmenities} placeholder="e.g. Perimeter fencing" />
        <TagListInput label="Neighborhood" values={neighborhood} onChange={setNeighborhood} placeholder="e.g. 5 mins from the express" />
        <PaymentPlanInput rows={paymentPlan} onChange={setPaymentPlan} />

        <FormField label="YouTube video URLs (one per line, optional)">
          <textarea
            rows={3}
            value={videoUrls}
            onChange={(e) => setVideoUrls(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={textInputClass()}
          />
        </FormField>
      </section>

      <SubmitButton loading={loading}>{isEdit ? "Save Changes" : "Create Estate"}</SubmitButton>
    </form>
  );
}
