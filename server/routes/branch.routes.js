import express from "express";
import {
  getAllBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  seedBranches,
} from "../controllers/branch.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createBranchSchema,
  updateBranchSchema,
} from "../schemas/branch.schema.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getAllBranches); // GET  /api/branches
router.get("/:id", getBranch); // GET  /api/branches/lagos

// ── Admin-protected ───────────────────────────────────────────────────────────
router.post("/", protect, isAdmin, validate(createBranchSchema), createBranch); // POST   /api/branches
router.put(
  "/:id",
  protect,
  isAdmin,
  validate(updateBranchSchema),
  updateBranch,
); // PUT    /api/branches/lagos
router.delete("/:id", protect, isAdmin, deleteBranch); // DELETE /api/branches/asaba
router.post("/seed", protect, isAdmin, seedBranches); // POST   /api/branches/seed

export default router;
