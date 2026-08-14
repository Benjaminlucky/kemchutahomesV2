import express from "express";
import {
  getKnowledgeBase,
  updateCompanyInfo,
  addFaq,
  updateFaq,
  deleteFaq,
  addNotice,
  updateNotice,
  deleteNotice,
} from "../controllers/knowledgeBase.controller.js";
import { protect, isAdmin, hasPermission } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  updateCompanyInfoSchema,
  addFaqSchema,
  updateFaqSchema,
  addNoticeSchema,
  updateNoticeSchema,
} from "../schemas/knowledgeBase.schema.js";

const router = express.Router();

// Public — used by chat controller at runtime
router.get("/", getKnowledgeBase);

// Admin only
router.put(
  "/company-info",
  protect,
  isAdmin,
  hasPermission("knowledge_base"),
  validate(updateCompanyInfoSchema),
  updateCompanyInfo,
);
router.post(
  "/faqs",
  protect,
  isAdmin,
  hasPermission("knowledge_base"),
  validate(addFaqSchema),
  addFaq,
);
router.put(
  "/faqs/:faqId",
  protect,
  isAdmin,
  hasPermission("knowledge_base"),
  validate(updateFaqSchema),
  updateFaq,
);
router.delete("/faqs/:faqId", protect, isAdmin, hasPermission("knowledge_base"), deleteFaq);
router.post(
  "/notices",
  protect,
  isAdmin,
  hasPermission("knowledge_base"),
  validate(addNoticeSchema),
  addNotice,
);
router.put(
  "/notices/:id",
  protect,
  isAdmin,
  hasPermission("knowledge_base"),
  validate(updateNoticeSchema),
  updateNotice,
);
router.delete("/notices/:id", protect, isAdmin, hasPermission("knowledge_base"), deleteNotice);

export default router;
