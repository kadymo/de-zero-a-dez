import { prisma } from "@/server/lib/prisma";
import { cloudinary } from "@/server/lib/cloudinary";

export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const { name, description, isPublic, coverUrl, filesUrls } = await readBody(event);

    await prisma.template.update({
        where: { id },
        data: {
            name,
            description,
            isPublic: isPublic === 1 ? true : false,
            cover: coverUrl,
            items: filesUrls
        }
    });
});
