import mongoose from "mongoose";

// ── Sub-schemas ──────────────────────────────────────────────────────────────
const galleryImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    caption: { type: String, default: "" },
  },
  { _id: false },
);

const youtubeVideoSchema = new mongoose.Schema(
  {
    videoId: { type: String, required: true }, // YouTube video ID (11 chars)
    title: { type: String, default: "" },
    url: { type: String }, // Full embed URL (computed)
  },
  { _id: false },
);

const amenitySchema = new mongoose.Schema(
  { name: { type: String, required: true } },
  { _id: false },
);

const neighborhoodSchema = new mongoose.Schema(
  { name: { type: String, required: true } },
  { _id: false },
);

const paymentPlanSchema = new mongoose.Schema(
  {
    plot: { type: String, required: true },
    outright: { type: String, required: true },
    initialDeposit: { type: String, required: true },
  },
  { _id: false },
);

// ── Main schema ──────────────────────────────────────────────────────────────
const estateSchema = new mongoose.Schema(
  {
    estate: {
      type: String,
      required: [true, "Estate name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    // Every slug this estate has ever used, kept so old shared/indexed links
    // survive a rename via a redirect instead of 404ing (PRD FR-1). Written
    // by the controller on rename, not by the pre-save hook below (renames
    // go through findByIdAndUpdate, which doesn't run save hooks).
    previousSlugs: { type: [String], default: [] },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      enum: ["Lagos", "Asaba", "Anambra", "Abuja"],
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      enum: ["Residential", "Commercial", "Investment"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      enum: [
        "CofO",
        "Gazette",
        "Excision",
        "Freehold",
        "Registered survey",
        "CofO in-view",
      ],
    },
    price: { type: String, required: [true, "Price is required"] },
    sqm: { type: String, required: [true, "Size is required"] },
    desc: { type: String, required: [true, "Description is required"] },
    category: {
      type: String,
      default: "Land",
      enum: ["Land", "House", "Duplex", "Flat", "Commercial"],
    },
    depositPercentage: { type: String, default: "30% Initial Deposit" },

    // ── Featured / banner image ──────────────────────────────────────────────
    img: {
      type: String,
      required: [true, "Featured image is required"],
    },
    imgPublicId: {
      type: String,
      required: [true, "Featured image public ID is required"],
    },

    // ── Gallery array ────────────────────────────────────────────────────────
    gallery: {
      type: [galleryImageSchema],
      default: [],
    },

    // ── YouTube videos ───────────────────────────────────────────────────────
    videos: {
      type: [youtubeVideoSchema],
      default: [],
    },

    // ── Estate layout map ────────────────────────────────────────────────────
    sytemap: { type: String, default: "" },

    amenities: { type: [amenitySchema], default: [] },
    neighborhood: { type: [neighborhoodSchema], default: [] },
    paymentPlan: { type: [paymentPlanSchema], default: [] },

    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Auto-generate embed URL virtual ─────────────────────────────────────────
estateSchema.virtual("videos.embedUrl").get(function () {
  return this.videos.map((v) => `https://www.youtube.com/embed/${v.videoId}`);
});

// ── Auto-generate slug before save ──────────────────────────────────────────
estateSchema.pre("save", function (next) {
  if (this.isModified("estate") || this.isNew) {
    this.slug = this.estate
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  }
  next();
});

// ── Indexes ──────────────────────────────────────────────────────────────────
estateSchema.index({ location: 1, purpose: 1, isActive: 1 });
estateSchema.index({ createdAt: -1 });

const Estate = mongoose.model("Estate", estateSchema);
export default Estate;
