const { cloudinary, upload } = require("../config/cloudinary");

function uploadImage(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Image must be under 5 MB" });
    }

    return res
      .status(400)
      .json({ message: err.message || "Image upload failed" });
  });
}

async function deleteOldImage(imageUrl) {
  if (!imageUrl) return;

  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/event-booking/filename.webp
    const parts = imageUrl.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${filename}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // Non-fatal — log and continue
    console.warn("[Cloudinary] Could not delete old image:", err.message);
  }
}

module.exports = { uploadImage, deleteOldImage };
