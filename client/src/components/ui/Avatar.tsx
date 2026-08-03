"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Same 135deg brand ramp the rest of the app uses for purple surfaces
// (ChatWidget, error.tsx, not-found.tsx, estate opengraph-image):
// customPurple-900 → customPurple-500.
export const AVATAR_GRADIENT = "linear-gradient(135deg, #3F0C91, #700CEB)";

/**
 * A realtor's stored `avatar` is either a genuinely uploaded photo (Cloudinary)
 * or a legacy `ui-avatars.com` URL the server generated as a placeholder. The
 * latter is a remote round-trip — and a layout-shifting one — for what is
 * really just two letters, so it counts as "no photo" and we draw the initials
 * ourselves instead.
 */
export function isRealPhoto(avatar?: string | null): boolean {
  return !!avatar && !avatar.includes("ui-avatars.com");
}

export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const initials = `${firstName?.trim()?.[0] ?? ""}${lastName?.trim()?.[0] ?? ""}`;
  return initials.toUpperCase() || "?";
}

export type AvatarProps = {
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  /** Rendered width and height in px. Also drives the initials' font size. */
  size?: number;
  className?: string;
};

export function Avatar({ firstName, lastName, avatar, size = 40, className }: AvatarProps) {
  // A stored Cloudinary URL can still 404 (asset deleted, cloud renamed). Left
  // alone that renders the browser's broken-image glyph; initials are a much
  // better failure mode, so treat a load error as "no photo".
  const [failed, setFailed] = useState(false);

  const name = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (isRealPhoto(avatar) && !failed) {
    return (
      <Image
        src={avatar as string}
        alt={name ? `${name}'s avatar` : "Realtor avatar"}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        style={{ width: size, height: size }}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name ? `${name}'s initials` : "Realtor initials"}
      // text-white is explicit rather than inherited: this codebase has been
      // bitten by prefers-color-scheme flipping an inherited --foreground.
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full leading-none font-bold text-white select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: AVATAR_GRADIENT,
        fontSize: Math.max(11, Math.round(size * 0.38)),
      }}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
