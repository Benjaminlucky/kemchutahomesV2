import express from "express";
import {
  bookInspection,
  getAllInspections,
  getInspectionById,
  createInspectionAdmin,
  updateInspection,
  updateInspectionStatus,
  updateInspectionNotes,
  deleteInspection,
} from "../controllers/inspection.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  bookInspectionSchema,
  createInspectionAdminSchema,
  updateInspectionAdminSchema,
  updateInspectionStatusSchema,
  updateInspectionNotesSchema,
} from "../schemas/inspection.schema.js";

const router = express.Router();

router.post("/", validate(bookInspectionSchema), bookInspection); // Public
router.get("/", protect, isAdmin, getAllInspections); // Admin
router.post(
  "/admin",
  protect,
  isAdmin,
  validate(createInspectionAdminSchema),
  createInspectionAdmin,
); // Admin — manual create (e.g. phone booking)
router.get("/:id", protect, isAdmin, getInspectionById); // Admin
router.put(
  "/:id",
  protect,
  isAdmin,
  validate(updateInspectionAdminSchema),
  updateInspection,
); // Admin — full edit
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
router.delete("/:id", protect, isAdmin, deleteInspection); // Admin

export default router;
