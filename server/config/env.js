import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Resolved relative to this file, not process.cwd() — a DirectAdmin/cPanel
// cron job (scripts/runJob.js) starts in the account's home directory, and
// the panel's "Setup Node.js App" environment variables only reach the web
// app, not cron, so the job has to find server/.env on its own.
dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });
