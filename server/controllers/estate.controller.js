import { isValidObjectId } from "mongoose";
import Estate from "../models/estate.model.js";
import EstateTombstone from "../models/estateTombstone.model.js";
import {
  uploadBuffer,
  deleteAsset,
  deleteAssets,
  extractYoutubeId,
} from "../utils/cloudinaryHelpers.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { triggerRevalidate } from "../utils/revalidate.js";
import { invalidateChatPromptCache } from "../utils/chatPromptCache.js";
import { getCached, invalidateCache } from "../utils/dataCache.js";

const ESTATE_TTL_MS = 5 * 60 * 1000; // PRD FR-3: same 5 min window as the other data caches
const estateCacheKey = (slug) => `estate:${slug}`;

// ── Slug generator (unique) ──────────────────────────────────────────────────
const generateUniqueSlug = async (name, excludeId = null) => {
  let base = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  let slug = base;
  let counter = 1;
  while (true) {
    const query = { slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) };
    const exists = await Estate.findOne(query).lean();
    if (!exists) break;
    slug = `${base}-${counter++}`;
  }
  return slug;
};

// ── :id guard ────────────────────────────────────────────────────────────────
// Mongoose casts :id at query time, so a malformed one ("not-an-objectid")
// throws a CastError *inside* the handler — which the generic catch blocks
// below then report as a 500 "Failed to …". That's a server error for what is
// plainly bad client input, and it hides real 500s in the logs. Every handler
// reading req.params.id calls this first and answers an honest 400 instead.
// Returns true when it has already sent the response.
const rejectedInvalidId = (req, res) => {
  if (isValidObjectId(req.params.id)) return false;
  res.status(400).json({ message: "Invalid estate ID" });
  return true;
};

// ── Parse videos input ───────────────────────────────────────────────────────
const parseVideos = (rawVideos = []) => {
  return rawVideos
    .map((v) => {
      const videoId = extractYoutubeId(
        typeof v === "string" ? v : v.videoId || v.url || "",
      );
      if (!videoId) return null;
      return {
        videoId,
        title: typeof v === "object" ? v.title || "" : "",
        url: `https://www.youtube.com/embed/${videoId}`,
      };
    })
    .filter(Boolean);
};

// ── GET /api/estates ─────────────────────────────────────────────────────────
export const getAllEstates = async (req, res) => {
  try {
    const {
      location,
      purpose,
      search,
      page = 1,
      limit = 20,
      active,
    } = req.query;
    const filter = {};

    if (active !== "all") filter.isActive = true;
    if (location && location !== "Choose Location") filter.location = location;
    if (purpose && purpose !== "Any Purpose") {
      filter.purpose = {
        $regex: new RegExp(`^${escapeRegex(purpose)}$`, "i"),
      };
    }
    if (search) {
      // Cap length — an escaped pattern is safe from ReDoS/injection, but an
      // unbounded string is still needless work for the query engine.
      const safeSearch = escapeRegex(String(search).slice(0, 100));
      filter.$or = [
        { estate: { $regex: safeSearch, $options: "i" } },
        { address: { $regex: safeSearch, $options: "i" } },
        { desc: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [estates, total] = await Promise.all([
      Estate.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Estate.countDocuments(filter),
    ]);

    // HTTP-cached (not in the in-memory store — filter/page/search combos are
    // effectively unbounded, so keying an in-process cache on them risks an
    // unbounded Map; a short s-maxage still lets a CDN/browser absorb repeat
    // requests for the same filter combo without that risk) — PRD FR-3.
    res.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
    res.json({
      estates,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("getAllEstates:", err);
    res.status(500).json({ message: "Failed to fetch estates" });
  }
};

// ── GET /api/estates/slug/:slug ──────────────────────────────────────────────
export const getEstateBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const estate = await getCached(estateCacheKey(slug), ESTATE_TTL_MS, () =>
      Estate.findOne({ slug }).lean(),
    );
    if (!estate) return res.status(404).json({ message: "Estate not found" });
    res.set("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
    res.json(estate);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch estate" });
  }
};

// ── GET /api/estates/id/:id ──────────────────────────────────────────────────
export const getEstateById = async (req, res) => {
  if (rejectedInvalidId(req, res)) return;
  try {
    const estate = await Estate.findById(req.params.id).lean();
    if (!estate) return res.status(404).json({ message: "Estate not found" });
    res.json(estate);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch estate" });
  }
};

// ── POST /api/estates ────────────────────────────────────────────────────────
export const createEstate = async (req, res) => {
  let uploadedFeatured = null;
  const uploadedGallery = [];

  try {
    // Validated + parsed by validateMultipart(createEstateSchema) — see routes.
    const body = req.validatedBody;

    // ── Featured image (required) ────────────────────────────────────────────
    if (!req.files?.img?.[0]) {
      return res.status(400).json({ message: "Featured image is required" });
    }

    uploadedFeatured = await uploadBuffer(
      req.files.img[0].buffer,
      "estates/featured",
      {
        transformation: [
          { width: 1200, height: 800, crop: "fill", gravity: "auto" },
        ],
      },
    );

    // ── Gallery images (optional) ────────────────────────────────────────────
    if (req.files?.gallery?.length) {
      for (const file of req.files.gallery) {
        const result = await uploadBuffer(file.buffer, "estates/gallery", {
          transformation: [
            { width: 1000, height: 700, crop: "fill", gravity: "auto" },
          ],
        });
        uploadedGallery.push({
          url: result.secure_url,
          publicId: result.public_id,
          caption: "",
        });
      }
    }

    // ── YouTube videos ───────────────────────────────────────────────────────
    const videos = parseVideos(body.videos || []);

    // ── Unique slug ──────────────────────────────────────────────────────────
    const slug = await generateUniqueSlug(body.estate);

    const estate = await Estate.create({
      ...body,
      slug,
      img: uploadedFeatured.secure_url,
      imgPublicId: uploadedFeatured.public_id,
      gallery: uploadedGallery,
      videos,
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      neighborhood: Array.isArray(body.neighborhood) ? body.neighborhood : [],
      paymentPlan: Array.isArray(body.paymentPlan) ? body.paymentPlan : [],
      createdBy: req.user._id,
    });

    triggerRevalidate(["estates", `estate:${slug}`]);
    invalidateChatPromptCache();
    res.status(201).json({ message: "Estate created successfully", estate });
  } catch (err) {
    // Clean up any uploads if DB save failed
    if (uploadedFeatured) await deleteAsset(uploadedFeatured.public_id);
    await deleteAssets(uploadedGallery.map((g) => g.publicId));
    console.error("createEstate:", err);
    res.status(500).json({ message: "Failed to create estate" });
  }
};

// ── PUT /api/estates/:id ─────────────────────────────────────────────────────
export const updateEstate = async (req, res) => {
  if (rejectedInvalidId(req, res)) return;
  const newlyUploaded = [];

  try {
    const estate = await Estate.findById(req.params.id);
    if (!estate) return res.status(404).json({ message: "Estate not found" });

    // Validated + parsed by validateMultipart(updateEstateSchema) — see routes.
    const body = req.validatedBody;
    const updates = { ...body };

    // ── Replace featured image ───────────────────────────────────────────────
    if (req.files?.img?.[0]) {
      const result = await uploadBuffer(
        req.files.img[0].buffer,
        "estates/featured",
        {
          transformation: [
            { width: 1200, height: 800, crop: "fill", gravity: "auto" },
          ],
        },
      );
      newlyUploaded.push(result.public_id);

      // Delete old featured image
      await deleteAsset(estate.imgPublicId);

      updates.img = result.secure_url;
      updates.imgPublicId = result.public_id;
    }

    // ── Append new gallery images ────────────────────────────────────────────
    if (req.files?.gallery?.length) {
      const newGallery = [];
      for (const file of req.files.gallery) {
        const result = await uploadBuffer(file.buffer, "estates/gallery", {
          transformation: [
            { width: 1000, height: 700, crop: "fill", gravity: "auto" },
          ],
        });
        newlyUploaded.push(result.public_id);
        newGallery.push({
          url: result.secure_url,
          publicId: result.public_id,
          caption: "",
        });
      }
      // Merge with existing gallery (kept ones come from body.gallery)
      const kept = Array.isArray(body.gallery) ? body.gallery : estate.gallery;
      updates.gallery = [...kept, ...newGallery];
    }

    // ── Update YouTube videos ────────────────────────────────────────────────
    if (body.videos !== undefined) {
      updates.videos = parseVideos(body.videos);
    }

    // ── Regenerate slug if name changed — keep the old one redirectable ──────
    let slugAddToSet;
    if (body.estate && body.estate !== estate.estate) {
      updates.slug = await generateUniqueSlug(body.estate, estate._id);
      slugAddToSet = { previousSlugs: estate.slug };
    }

    // Remove fields that shouldn't be bulk-set this way
    delete updates._id;
    delete updates.__v;
    delete updates.createdBy;
    delete updates.createdAt;
    delete updates.previousSlugs;

    const updated = await Estate.findByIdAndUpdate(
      req.params.id,
      { $set: updates, ...(slugAddToSet && { $addToSet: slugAddToSet }) },
      { new: true, runValidators: true },
    );

    triggerRevalidate(["estates", `estate:${estate.slug}`, `estate:${updated.slug}`]);
    invalidateChatPromptCache();
    invalidateCache(estateCacheKey(estate.slug));
    invalidateCache(estateCacheKey(updated.slug));
    res.json({ message: "Estate updated successfully", estate: updated });
  } catch (err) {
    // Clean up any new uploads if update failed
    await deleteAssets(newlyUploaded);
    console.error("updateEstate:", err);
    res.status(500).json({ message: "Failed to update estate" });
  }
};

// ── DELETE /api/estates/:id ──────────────────────────────────────────────────
export const deleteEstate = async (req, res) => {
  if (rejectedInvalidId(req, res)) return;
  try {
    const estate = await Estate.findById(req.params.id);
    if (!estate) return res.status(404).json({ message: "Estate not found" });

    // Delete featured + all gallery images from Cloudinary
    const publicIds = [
      estate.imgPublicId,
      ...estate.gallery.map((g) => g.publicId),
    ];
    await deleteAssets(publicIds);

    await estate.deleteOne();

    // Tombstone every slug this estate ever answered to (live + rename
    // history) so a request for it after deletion redirects to /developments
    // instead of a bare 404 indistinguishable from a slug that never existed.
    await Promise.all(
      [estate.slug, ...(estate.previousSlugs || [])].map((slug) =>
        EstateTombstone.updateOne(
          { slug },
          { $setOnInsert: { slug, estateName: estate.estate } },
          { upsert: true },
        ).catch(() => null),
      ),
    );

    triggerRevalidate(["estates", `estate:${estate.slug}`]);
    invalidateChatPromptCache();
    invalidateCache(estateCacheKey(estate.slug));
    res.json({ message: "Estate deleted successfully" });
  } catch (err) {
    console.error("deleteEstate:", err);
    res.status(500).json({ message: "Failed to delete estate" });
  }
};

// ── GET /api/estates/redirect/:slug ──────────────────────────────────────────
// Public. Resolves an old/removed slug to where the client should redirect:
//   - renamed estate still active  → /estate/<current slug>
//   - renamed estate now inactive, or the estate was hard-deleted → /developments
//   - neither → 404 (caller should render a real not-found page)
export const getEstateRedirect = async (req, res) => {
  try {
    const renamed = await Estate.findOne({ previousSlugs: req.params.slug })
      .select("slug isActive")
      .lean();
    if (renamed) {
      return res.json({
        target: renamed.isActive ? `/estate/${renamed.slug}` : "/developments",
      });
    }

    const tombstoned = await EstateTombstone.exists({ slug: req.params.slug });
    if (tombstoned) {
      return res.json({ target: "/developments" });
    }

    res.status(404).json({ message: "No redirect found" });
  } catch (err) {
    console.error("getEstateRedirect:", err);
    res.status(500).json({ message: "Failed to resolve redirect" });
  }
};

// ── DELETE gallery image  /api/estates/:id/gallery/:publicId ─────────────────
export const deleteGalleryImage = async (req, res) => {
  if (rejectedInvalidId(req, res)) return;
  try {
    const estate = await Estate.findById(req.params.id);
    if (!estate) return res.status(404).json({ message: "Estate not found" });

    const publicId = decodeURIComponent(req.params.publicId);
    await deleteAsset(publicId);

    estate.gallery = estate.gallery.filter((img) => img.publicId !== publicId);
    await estate.save();

    triggerRevalidate(["estates", `estate:${estate.slug}`]);
    invalidateChatPromptCache();
    invalidateCache(estateCacheKey(estate.slug));
    res.json({ message: "Gallery image deleted", gallery: estate.gallery });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete gallery image" });
  }
};

// ── PATCH /api/estates/:id/toggle ────────────────────────────────────────────
export const toggleEstateStatus = async (req, res) => {
  if (rejectedInvalidId(req, res)) return;
  try {
    const estate = await Estate.findById(req.params.id);
    if (!estate) return res.status(404).json({ message: "Estate not found" });

    estate.isActive = !estate.isActive;
    await estate.save();

    triggerRevalidate(["estates", `estate:${estate.slug}`]);
    invalidateChatPromptCache();
    invalidateCache(estateCacheKey(estate.slug));
    res.json({
      message: `Estate ${estate.isActive ? "activated" : "deactivated"}`,
      isActive: estate.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle estate status" });
  }
};
