const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extract public ID from Cloudinary URL
 * URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}
 */
const extractPublicIdFromUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  try {
    // For Cloudinary URLs
    if (imageUrl.includes('cloudinary.com')) {
      // Extract the public ID from the URL
      const parts = imageUrl.split('/upload/');
      if (parts.length > 1) {
        const publicIdWithExtension = parts[1].split('/').slice(1).join('/');
        // Remove extension
        const publicId = publicIdWithExtension.replace(/\.[^.]*$/, '');
        return publicId;
      }
    }
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
  }

  return null;
};

/**
 * Delete image from Cloudinary
 */
const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return { success: false, message: 'No image URL provided' };

    const publicId = extractPublicIdFromUrl(imageUrl);

    if (!publicId) {
      console.warn('Could not extract public ID from URL:', imageUrl);
      return { success: false, message: 'Invalid image URL format' };
    }

    const result = await cloudinary.api.delete_resources([publicId], {
      type: 'upload',
      resource_type: 'image',
    });

    console.log('Image deleted from Cloudinary:', publicId, result);
    return { success: true, publicId, result };
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  deleteImageFromCloudinary,
  extractPublicIdFromUrl,
};
