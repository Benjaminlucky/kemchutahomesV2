import multer from "multer";

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"), false);
  } else {
    cb(null, true);
  }
};

// ── Existing: single avatar upload ──────────────────────────────────────────
export const uploadSingleImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
}).single("avatar");

// ── New: estate images (1 featured + up to 15 gallery) ───────────────────────
export const uploadEstateImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB per file
}).fields([
  { name: "img", maxCount: 1 }, // featured / banner image
  { name: "gallery", maxCount: 15 }, // gallery array
]);
