import Branch from "../models/branch.model.js";
import { triggerRevalidate } from "../utils/revalidate.js";
import { getCached, invalidateCache } from "../utils/dataCache.js";

const CACHE_KEY = "branches";
const TTL_MS = 5 * 60 * 1000; // PRD FR-3: same 5 min window as the other data caches

// ── Default seed data (runs once on first request if DB is empty) ─────────────
const DEFAULTS = [
  {
    branchId: "lagos",
    label: "Lagos",
    isHQ: true,
    address: "12 Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.721856773014!2d3.463694374869946!3d6.431866293565208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf53280e7648d%3A0x3df37d35c3a0bce0!2sLekki%20Phase%201%2C%20Lagos!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng",
    mapLink: "https://maps.google.com/?q=Lekki+Phase+1+Lagos",
    phones: ["+234 800 000 0001", "+234 800 000 0002"],
    emails: ["info@kemchutahomesltd.com"],
    hours: {
      weekdays: "Mon – Fri: 8:00am – 6:00pm",
      saturday: "Sat: 9:00am – 3:00pm",
      sunday: "Closed",
    },
    social: {
      instagram: "https://instagram.com/kemchutahomesltd",
      facebook: "https://facebook.com/kemchutahomes",
      twitter: "",
      whatsapp: "",
      youtube: "",
    },
    isActive: true,
  },
  {
    branchId: "asaba",
    label: "Asaba",
    isHQ: false,
    address: "Plot 14 Ibusa Road, Asaba, Delta State, Nigeria",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0!2d6.689!3d6.1965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1040c3a5ebab2b71%3A0x94d21f0f5a6e87a0!2sAsaba%2C%20Delta%20State!5e0!3m2!1sen!2sng!4v1700000000001!5m2!1sen!2sng",
    mapLink: "https://maps.google.com/?q=Asaba+Delta+State+Nigeria",
    phones: ["+234 800 000 0003", "+234 800 000 0004"],
    emails: ["asaba@kemchutahomesltd.com"],
    hours: {
      weekdays: "Mon – Fri: 8:00am – 5:30pm",
      saturday: "Sat: 9:00am – 2:00pm",
      sunday: "Closed",
    },
    social: {
      instagram: "",
      facebook: "",
      twitter: "",
      whatsapp: "",
      youtube: "",
    },
    isActive: true,
  },
];

async function ensureDefaults() {
  const count = await Branch.countDocuments();
  if (count === 0) {
    await Branch.insertMany(DEFAULTS);
    console.log("✅ Branch defaults seeded");
  }
}

async function loadBranches() {
  await ensureDefaults();
  return Branch.find().sort({ isHQ: -1, label: 1 }).lean();
}

// ── GET /api/branches  (public — Contact page reads this) ─────────────────────
export const getAllBranches = async (req, res) => {
  try {
    const branches = await getCached(CACHE_KEY, TTL_MS, loadBranches);
    res.set("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
    res.json(branches);
  } catch (err) {
    console.error("getAllBranches:", err);
    res.status(500).json({ message: "Failed to fetch branches" });
  }
};

// ── GET /api/branches/:id  (public) ──────────────────────────────────────────
export const getBranch = async (req, res) => {
  try {
    const branch = await Branch.findOne({
      branchId: req.params.id.toLowerCase(),
    }).lean();
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch branch" });
  }
};

// ── PUT /api/branches/:id  (admin) — update any field ─────────────────────────
export const updateBranch = async (req, res) => {
  try {
    const {
      label,
      address,
      mapEmbedUrl,
      mapLink,
      phones,
      emails,
      hours,
      social,
      isActive,
    } = req.body;

    const update = {};
    if (label !== undefined) update.label = label;
    if (address !== undefined) update.address = address.trim();
    if (mapEmbedUrl !== undefined) update.mapEmbedUrl = mapEmbedUrl.trim();
    if (mapLink !== undefined) update.mapLink = mapLink.trim();
    if (phones !== undefined)
      update.phones = Array.isArray(phones) ? phones.filter(Boolean) : [];
    if (emails !== undefined)
      update.emails = Array.isArray(emails) ? emails.filter(Boolean) : [];
    if (hours !== undefined) update.hours = hours;
    if (social !== undefined) update.social = social;
    if (isActive !== undefined) update.isActive = Boolean(isActive);

    const branch = await Branch.findOneAndUpdate(
      { branchId: req.params.id.toLowerCase() },
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!branch) return res.status(404).json({ message: "Branch not found" });
    triggerRevalidate(["branches"]);
    invalidateCache(CACHE_KEY);
    res.json({ message: "Branch updated successfully", branch });
  } catch (err) {
    console.error("updateBranch:", err);
    res.status(500).json({ message: "Failed to update branch" });
  }
};

// ── POST /api/branches  (admin) — create a new branch ────────────────────────
export const createBranch = async (req, res) => {
  try {
    const {
      branchId,
      label,
      address,
      phones,
      emails,
      mapEmbedUrl,
      mapLink,
      hours,
      social,
    } = req.body;

    if (!branchId?.trim() || !label?.trim()) {
      return res
        .status(400)
        .json({ message: "branchId and label are required" });
    }

    const exists = await Branch.findOne({
      branchId: branchId.trim().toLowerCase(),
    });
    if (exists)
      return res
        .status(409)
        .json({ message: "A branch with that ID already exists" });

    const branch = await Branch.create({
      branchId: branchId.trim().toLowerCase(),
      label: label.trim(),
      address: address?.trim() || "",
      phones: Array.isArray(phones) ? phones.filter(Boolean) : [],
      emails: Array.isArray(emails) ? emails.filter(Boolean) : [],
      mapEmbedUrl: mapEmbedUrl?.trim() || "",
      mapLink: mapLink?.trim() || "",
      hours: hours || {},
      social: social || {},
    });

    triggerRevalidate(["branches"]);
    invalidateCache(CACHE_KEY);
    res.status(201).json({ message: "Branch created", branch });
  } catch (err) {
    // Two concurrent creates for the same branchId can both pass the findOne
    // pre-check above; the unique index is what actually prevents the dupe.
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "A branch with that ID already exists" });
    }
    console.error("createBranch:", err);
    res.status(500).json({ message: "Failed to create branch" });
  }
};

// ── DELETE /api/branches/:id  (admin) — can't delete HQ ──────────────────────
export const deleteBranch = async (req, res) => {
  try {
    const branchId = req.params.id.toLowerCase();
    const branch = await Branch.findOne({ branchId });
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    if (branch.isHQ)
      return res
        .status(400)
        .json({ message: "Cannot delete the headquarters branch" });

    await Branch.deleteOne({ branchId });
    triggerRevalidate(["branches"]);
    invalidateCache(CACHE_KEY);
    res.json({ message: "Branch deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete branch" });
  }
};

// ── POST /api/branches/seed  (admin) — re-seed if needed ─────────────────────
export const seedBranches = async (req, res) => {
  try {
    await Branch.deleteMany({});
    await Branch.insertMany(DEFAULTS);
    triggerRevalidate(["branches"]);
    invalidateCache(CACHE_KEY);
    res.json({ message: "Branches re-seeded with defaults" });
  } catch (err) {
    res.status(500).json({ message: "Seed failed" });
  }
};
