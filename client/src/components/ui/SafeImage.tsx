"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

// The brand's deep purple-black, the same ramp used for dark surfaces
// elsewhere (DevelopingEstate's section background, EstateDetails' gallery
// strip). Deliberately dark at *every* call site rather than tinted per
// context: each place a public estate photo is rendered also stacks white
// chrome on top of it — price, location pill, purpose badge — so a light
// placeholder would leave that white text unreadable the moment the photo is
// the thing that failed.
const FALLBACK_BACKGROUND = "linear-gradient(135deg, #1a1030 0%, #0f0a1e 100%)";

export type SafeImageProps = ImageProps & {
  /** Extra classes for the placeholder only — never applied to the <Image>. */
  fallbackClassName?: string;
  fallbackIconSize?: number;
};

/**
 * next/image plus the fallback every public estate photo was missing.
 *
 * Estate documents always carry `img` (schema-required, enforced on create),
 * so this is not about absent data — it is about a Cloudinary asset that is
 * later deleted, renamed, or simply unreachable. Bare <Image> renders the
 * browser's broken-image glyph for that, which on a full-bleed hero is a very
 * loud failure. Same shape as Avatar's `failed` flag and the dashboard's
 * Thumb/Cover helpers; this one is shared because four public call sites
 * needed the identical few lines.
 *
 * `failedSrc` stores *which* src failed rather than a boolean: the lightbox
 * reuses one instance while paging through images, and a boolean would latch
 * on after the first bad photo and hide every good one after it.
 */
export function SafeImage({
  fallbackClassName,
  fallbackIconSize = 32,
  onError,
  ...imageProps
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  const { src, alt, fill, width, height } = imageProps;

  // next/image throws outright on an empty src, so guard that here too.
  if (!src || failedSrc === src) {
    return (
      <div
        // Decorative images pass alt="" — announcing "image" for those would
        // add noise, so they become aria-hidden instead.
        {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
        className={cn(
          "flex items-center justify-center text-white/25",
          // `fill` images are positioned by the parent, so the placeholder has
          // to fill that same box instead of collapsing to the icon's size.
          fill && "absolute inset-0 h-full w-full",
          fallbackClassName,
        )}
        style={{ background: FALLBACK_BACKGROUND, ...(fill ? {} : { width, height }) }}
      >
        <ImageOff size={fallbackIconSize} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    // alt is required by ImageProps and always arrives inside imageProps; the
    // a11y rule just can't see through the spread.
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      {...imageProps}
      onError={(event) => {
        setFailedSrc(src);
        // Forwarded so a call site can clear its own loading skeleton, which
        // otherwise waits on an onLoad that is never coming.
        onError?.(event);
      }}
    />
  );
}
