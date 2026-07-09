import express from "express";
import { submitContactForm } from "../controllers/contact.controller.js";
import { contactLimiter } from "../middlewares/rateLimiters.js";
import { validate } from "../middlewares/validate.js";
import { submitContactFormSchema } from "../schemas/contact.schema.js";

const router = express.Router();

// POST /api/contact — public
router.post(
  "/",
  contactLimiter,
  validate(submitContactFormSchema),
  submitContactForm,
);

export default router;
