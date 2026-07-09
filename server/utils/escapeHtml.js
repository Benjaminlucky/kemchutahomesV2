const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// Escapes user-controlled strings before interpolating them into HTML email
// templates. Without this, form fields like name/subject/message can inject
// markup or links into the admin/client emails they end up in.
export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);

// Strips CR/LF so user input can't inject extra headers into an email
// Subject: line (header injection).
export const stripCrlf = (value) => String(value ?? "").replace(/[\r\n]+/g, " ");
