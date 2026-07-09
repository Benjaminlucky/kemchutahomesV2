import express from "express";
import {
  getKnowledgeBase,
  updateCompanyInfo,
  addFaq,
  updateFaq,
  deleteFaq,
  addNotice,
  deleteNotice,
} from "../controllers/knowledgeBase.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  updateCompanyInfoSchema,
  addFaqSchema,
  updateFaqSchema,
  addNoticeSchema,
} from "../schemas/knowledgeBase.schema.js";

const router = express.Router();

// Public — used by chat controller at runtime
router.get("/", getKnowledgeBase);

// Admin only
router.put(
  "/company-info",
  protect,
  isAdmin,
  validate(updateCompanyInfoSchema),
  updateCompanyInfo,
);
router.post("/faqs", protect, isAdmin, validate(addFaqSchema), addFaq);
router.put(
  "/faqs/:faqId",
  protect,
  isAdmin,
  validate(updateFaqSchema),
  updateFaq,
);
router.delete("/faqs/:faqId", protect, isAdmin, deleteFaq);
router.post("/notices", protect, isAdmin, validate(addNoticeSchema), addNotice);
router.delete("/notices/:id", protect, isAdmin, deleteNotice);

export default router;
