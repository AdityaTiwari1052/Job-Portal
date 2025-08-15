import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} buffer The file buffer to upload.
 * @param {string} folder The Cloudinary folder to upload into.
 * @returns {Promise<object>} A promise that resolves with the upload result.
 */
export const uploadBufferToCloudinary = (buffer, folder = "recruiter-logos") => {
  return new Promise((resolve, reject) => {
    // Create an upload stream
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary stream upload error:", error);
          return reject(error);
        }
        resolve({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    );

    // Write the buffer to the stream and end it
    stream.end(buffer);
  });
};

export default cloudinary;