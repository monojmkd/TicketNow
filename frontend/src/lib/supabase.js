const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BUCKET = "event-images";

/**
 * Upload a file to Supabase Storage and return its public URL.
 *
 * Uses the Supabase Storage REST API directly — no npm package needed.
 * The anon key is safe to use here because the bucket policy restricts
 * what unauthenticated callers can do.
 *
 * @param {File}   file        - The File object from an <input type="file">
 * @param {string} folder      - Subfolder inside the bucket, e.g. 'events'
 * @returns {Promise<string>}  - The public URL of the uploaded file
 */
export async function uploadImage(file, folder = "events") {
  // Build a unique filename: folder/timestamp-originalname
  // This avoids collisions if two organizers upload a file with the same name
  const ext = file.name.split(".").pop();
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": file.type,
      "x-upsert": "false",
    },
    body: file,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Image upload failed");
  }

  // Construct the public URL — no signed URL needed for a public bucket
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}
