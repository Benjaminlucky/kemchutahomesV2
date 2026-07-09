// Escapes regex metacharacters so user-supplied search/filter strings can't
// alter query semantics or build catastrophic-backtracking (ReDoS) patterns
// when interpolated into new RegExp() / a Mongo $regex filter.
export const escapeRegex = (value) =>
  String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
