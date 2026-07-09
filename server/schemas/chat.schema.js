import { z } from "zod";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000, "Message is too long"),
});

// The controller already slices to the last 20 messages before calling Groq;
// this cap just stops a client from making us validate/hold an arbitrarily
// large array first — see PRD's noted per-message chatbot cost/latency concern.
export const chatSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "messages array is required")
    .max(50),
});
