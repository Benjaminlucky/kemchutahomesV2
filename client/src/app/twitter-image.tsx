// Twitter Cards read `twitter:image` separately from `og:image` — same
// generic branded card, reusing the sitewide opengraph-image rather than
// duplicating the generation logic.
export { default, alt, size, contentType } from "./opengraph-image";
