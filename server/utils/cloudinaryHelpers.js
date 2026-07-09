import { Readable } from "stream";
import cloudinary from "./cloudinary.config.js";

/**
 * Upload a buffer directly to Cloudinary
 * @param {Buffer} buffer
 * @param {string} folder  - Cloudinary folder
 * @param {object} options - Extra Cloudinary options
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadBuffer = (buffer, folder = "estates", options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        quality: "auto:good",
        fetch_format: "auto",
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      },
    );
    Readable.from(buffer).pipe(stream);
  });
};

/**
 * Delete an asset from Cloudinary by public_id
 * Silently ignores missing assets
 */
export const deleteAsset = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (err) {
    console.error(`Cloudinary delete failed [${publicId}]:`, err.message);
  }
};

/**
 * Delete multiple assets in parallel
 */
export const deleteAssets = async (publicIds = []) => {
  await Promise.all(publicIds.filter(Boolean).map(deleteAsset));
};

/**
 * Extract and validate a YouTube video ID from a URL or bare ID
 * Supports: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, bare ID
 * Returns null if invalid
 */
export const extractYoutubeId = (input) => {
  if (!input) return null;
  const clean = input.trim();

  // Already a bare ID (11 chars, no slashes)
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match) return match[1];
  }

  return null;
};
