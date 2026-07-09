import express from "express";
import { handleChat } from "../controllers/chat.controller.js";
import { chatLimiter } from "../middlewares/rateLimiters.js";
import { validate } from "../middlewares/validate.js";
import { chatSchema } from "../schemas/chat.schema.js";

const router = express.Router();

// POST /api/chat  — public, no auth required
router.post("/", chatLimiter, validate(chatSchema), handleChat);

export default router;
