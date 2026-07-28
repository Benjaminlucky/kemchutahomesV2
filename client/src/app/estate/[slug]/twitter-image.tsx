// Twitter Cards read `twitter:image` separately from `og:image` — same
// per-estate branded card, reusing the opengraph-image generation logic
// rather than duplicating it (and its remote-photo-fetch failure handling).
export { default, alt, size, contentType } from "./opengraph-image";
