/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { v2 as cloudinary } from 'cloudinary';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = !!(
  CLOUDINARY_CLOUD_NAME &&
  CLOUDINARY_API_KEY &&
  CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  console.log('☁️ Cloudinary initialized successfully.');
} else {
  console.log('⚠️ Cloudinary credentials missing. Using local base64 fallback for uploaded images.');
}

/**
 * Uploads an image base64 string to Cloudinary, with a fallback
 */
export async function uploadToCloudinary(base64Image: string): Promise<string> {
  if (!base64Image) {
    throw new Error('No image data provided for upload');
  }

  // If already a regular URL, just return it
  if (base64Image.startsWith('http://') || base64Image.startsWith('https://')) {
    return base64Image;
  }

  if (!isCloudinaryConfigured) {
    // Graceful fallback: return the base64 URI directly (browser can render it seamlessly)
    return base64Image;
  }

  try {
    // Cloudinary upload expects either file path, URL, or data URI
    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: 'community_hero',
      resource_type: 'image',
    });
    return uploadResult.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload failed, falling back to base64:', error);
    return base64Image;
  }
}
