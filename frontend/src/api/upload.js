/**
 * Upload an image to Cloudinary via the backend.
 *
 * The backend's multer + Cloudinary middleware handles the actual upload.
 * We never talk to Cloudinary directly from the frontend — credentials
 * stay server-side.
 *
 * This is NOT called standalone. It is used inside buildEventFormData()
 * which packages all event fields + the image into one multipart request.
 *
 * @param   {File}   file  - File object from <input type="file">
 * @returns {File}         - Returns the file as-is for FormData appending
 */
export function prepareImage(file) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    throw new Error("Only JPG, PNG, and WebP images are allowed");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be under 5 MB");
  }
  return file;
}

/**
 * Build a FormData object from event fields + optional image file.
 * Use this instead of JSON.stringify() when submitting event forms.
 *
 * @param   {object} fields - Event fields (title, date, location, etc.)
 * @param   {File|null} imageFile - Optional image file
 * @returns {FormData}
 */
export function buildEventFormData(fields, imageFile = null) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  if (imageFile) {
    const validatedFile = prepareImage(imageFile);
    formData.append("image", validatedFile); // must match upload.single("image") in backend
  }

  return formData;
}
