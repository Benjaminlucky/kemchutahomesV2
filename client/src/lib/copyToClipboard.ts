"use client";

// navigator.clipboard.writeText is the right API, but it is not dependable on
// its own: it rejects outright when the document isn't focused, it is absent
// on insecure origins, and it can sit pending indefinitely instead of settling
// (observed in an automated Chrome window with the permission already
// granted). Any of those leaves a caller that simply awaits it hanging
// forever, so the button spins and the user is told nothing.
//
// Hence: bound the async attempt with a timeout, then fall back to the legacy
// execCommand path, which is synchronous and needs no permission.

const CLIPBOARD_TIMEOUT_MS = 1500;

function legacyCopy(text: string): boolean {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // Keep it out of view and out of the tab order, but still focusable —
    // execCommand("copy") only copies from a selection in a rendered node.
    textarea.setAttribute("readonly", "");
    textarea.setAttribute("aria-hidden", "true");
    textarea.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0;";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/** Copies `text`, returning whether it actually made it to the clipboard. Never rejects, never hangs. */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    const copied = await Promise.race([
      navigator.clipboard.writeText(text).then(
        () => true,
        () => false,
      ),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), CLIPBOARD_TIMEOUT_MS)),
    ]);
    if (copied) return true;
  }
  return legacyCopy(text);
}
