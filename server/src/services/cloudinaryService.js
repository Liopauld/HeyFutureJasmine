import cloudinary from "../config/cloudinary.js";

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Stream a buffer to Cloudinary. Note: Cloudinary stores audio under the
 * "video" resource_type, so voice notes should be uploaded with "video".
 */
export async function uploadToCloudinary(buffer, folder, resourceType = "auto") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `heyfuturejasmine/${folder}`,
        resource_type: resourceType,
        use_filename: false,
        unique_filename: true,
        overwrite: false,
        ...(resourceType === "image" && {
          transformation: [{ quality: "auto", fetch_format: "auto" }]
        })
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId, resourceType = "image") {
  if (!publicId || !isCloudinaryConfigured()) return;
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
