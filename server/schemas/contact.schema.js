import { z } from "zod";
import { email } from "./common.js";

export const submitContactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email,
  phone: z.string().trim().max(30, "Phone number is too long").optional(),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject is too long"),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message is too long"),
  branch: z.string().trim().max(100).optional(),
});
