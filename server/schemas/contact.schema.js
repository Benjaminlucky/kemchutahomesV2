import { z } from "zod";
import { email } from "./common.js";

export const submitContactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email,
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(1, "Subject is required"),
  message: z.string().trim().min(1, "Message is required"),
  branch: z.string().trim().optional(),
});
