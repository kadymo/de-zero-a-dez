import { cloudinary } from "@/server/lib/cloudinary";

export default defineEventHandler(async (event) => {
    const files = await readMultipartFormData(event);

    const urls = files!.map(async (file) => {
        const base64 = file.data.toString("base64");
        const fileURI = `data:${file.type};base64,${base64}`;

        const { secure_url } = await cloudinary.uploader.upload(fileURI, { folder: "De Zero a Dez" });

        return secure_url;
    });

    const filesUrls = await Promise.all(urls);

    return filesUrls;
});
