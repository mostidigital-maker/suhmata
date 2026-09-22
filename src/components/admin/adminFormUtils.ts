import { supabase } from "@/integrations/supabase/client";

export const inputClass =
  "min-h-11 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring";

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** For photos, logos, covers, thumbnails — anything that must actually be an image. */
export async function uploadImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) throw new Error("Please select an image file.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Image must be smaller than 8 MB.");
  return uploadFile(file, folder, 8);
}

/**
 * For archive items and other non-image uploads (documents, audio, video).
 * No MIME-type restriction — only a size cap — since the archive is
 * explicitly meant to hold scans, recordings and clips, not just photos.
 */
export async function uploadFile(file: File, folder: string, maxSizeMB = 25) {
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File must be smaller than ${maxSizeMB} MB.`);
  }
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}
