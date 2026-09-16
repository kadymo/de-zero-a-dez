import { prisma } from "@/server/lib/prisma";
import { cloudinary } from "@/server/lib/cloudinary";

export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const { name, description, isPublic, coverUrl, filesUrls, items } = await readBody(event);

    const currentTemplate = await prisma.template.findUnique({
        where: { id }
    });

    if (!currentTemplate) {
        throw createError({
            status: 404,
            statusText: "Template não encontrado"
        });
    }

    const baseItems = Array.isArray(items) ? items : currentTemplate.items;
    const finalItems = filesUrls ? [...baseItems, ...filesUrls] : baseItems;

    await prisma.template.update({
        where: { id },
        data: {
            name,
            description,
            isPublic: isPublic === 1 || isPublic === true,
            cover: coverUrl || currentTemplate.cover,
            items: finalItems
        }
    });

    return { success: true };
});
