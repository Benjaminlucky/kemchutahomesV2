import express from "express";
import {
  getAllEstates,
  getEstateBySlug,
  getEstateById,
  getEstateRedirect,
  createEstate,
  updateEstate,
  deleteEstate,
  deleteGalleryImage,
  toggleEstateStatus,
} from "../controllers/estate.controller.js";

import { isAdmin, protect, hasPermission } from "../middlewares/authMiddleware.js";
import { uploadEstateImages } from "../middlewares/upload.middleware.js";
import { validate, validateMultipart } from "../middlewares/validate.js";
import {
  createEstateSchema,
  updateEstateSchema,
  estateQuerySchema,
} from "../schemas/estate.schema.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", validate(estateQuerySchema, "query"), getAllEstates);
router.get("/slug/:slug", getEstateBySlug);
router.get("/id/:id", getEstateById);
router.get("/redirect/:slug", getEstateRedirect);

// ── Admin-protected ───────────────────────────────────────────────────────────
router.post(
  "/",
  protect,
  isAdmin,
  hasPermission("manage_estates"),
  uploadEstateImages,
  validateMultipart(createEstateSchema),
  createEstate,
);
router.put(
  "/:id",
  protect,
  isAdmin,
  hasPermission("manage_estates"),
  uploadEstateImages,
  validateMultipart(updateEstateSchema),
  updateEstate,
);
router.delete("/:id", protect, isAdmin, hasPermission("manage_estates"), deleteEstate);
router.delete(
  "/:id/gallery/:publicId",
  protect,
  isAdmin,
  hasPermission("manage_estates"),
  deleteGalleryImage,
);
router.patch("/:id/toggle", protect, isAdmin, hasPermission("manage_estates"), toggleEstateStatus);

export default router;
