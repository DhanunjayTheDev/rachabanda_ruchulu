# Cloudinary Setup Guide

To enable image uploads for food and category management, you need to set up Cloudinary credentials.

## Steps to Set Up Cloudinary

1. **Create/Login to Cloudinary Account**
   - Go to https://cloudinary.com/
   - Sign up for a free account if you don't have one
   - Log in to your dashboard

2. **Get Your Credentials**
   - In your Cloudinary Dashboard, go to Settings → API Keys
   - You'll find:
     - **Cloud Name**: Your unique cloud identifier
     - **API Key**: Your API key
     - **API Secret**: Your API secret

3. **Update .env File**
   - Open `server/.env`
   - Replace the placeholders with your Cloudinary credentials:
   ```
   CLOUDINARY_NAME=your_actual_cloud_name
   CLOUDINARY_API_KEY=your_actual_api_key
   CLOUDINARY_API_SECRET=your_actual_api_secret
   ```

4. **Restart the Server**
   - The image uploads will now work
   - Images will be automatically uploaded to Cloudinary and stored in your database

## How It Works

### For Foods:
- Go to Admin Dashboard → Foods Management
- Click "+ Add New Food"
- Fill in food details (name, price, category, etc.)
- Upload an image - it will be previewed before submission
- Submit to create food with image stored on Cloudinary

### For Categories:
- Go to Admin Dashboard → Categories Management
- Click "+ Add Category"
- Fill in category details
- Upload a category image
- Submit to create category with image

## Features Implemented

✅ Image upload via file input
✅ Image preview before submission
✅ Cloudinary integration for cloud storage
✅ Automatic image URL generation
✅ Support for edit/update with new images
✅ Error handling for failed uploads
✅ File size limit: 5MB
✅ Supported formats: jpg, jpeg, png, gif, webp

## Notes

- Images are stored on Cloudinary (cloud-based, no server storage)
- Cloudinary provides free tier with generous limits:
  - 25 credits/month (equivalent to storing 25GB of images)
  - No autofill of fees with free account
- All images are organized under 'rachabanda_ruchulu' folder on Cloudinary
