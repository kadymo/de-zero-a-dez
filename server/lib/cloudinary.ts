import { v2 } from "cloudinary";

export const cloudinary = v2;

cloudinary.config({
    cloud_name: process.env.NUXT_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NUXT_CLOUDINARY_API_KEY,
    api_secret: process.env.NUXT_CLOUDINARY_CLOUD_SECRET
});
