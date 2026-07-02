import cloudinary from "../config/cloudinary.js";

export async function uploadToCloudinary(buffer, folder, resourceType = "auto") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `HeyFutureJasmine!/${folder}`,
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
