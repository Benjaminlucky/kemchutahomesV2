import express from "express";
import {
  bookInspection,
  getAllInspections,
  updateInspectionStatus,
  updateInspectionNotes,
} from "../controllers/inspection.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  bookInspectionSchema,
  updateInspectionStatusSchema,
  updateInspectionNotesSchema,
} from "../schemas/inspection.schema.js";

const router = express.Router();

router.post("/", validate(bookInspectionSchema), bookInspection); // Public
router.get("/", protect, isAdmin, getAllInspections); // Admin
router.patch(
  "/:id/status",
  protect,
  isAdmin,
  validate(updateInspectionStatusSchema),
  updateInspectionStatus,
); // Admin
router.patch(
  "/:id/notes",
  protect,
  isAdmin,
  validate(updateInspectionNotesSchema),
  updateInspectionNotes,
); // Admin

export default router;
