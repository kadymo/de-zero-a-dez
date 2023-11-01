import { getServerSession } from "#auth";
import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
    const { name, description, isPublic, coverUrl, filesUrls } = await readBody(event);

    const session = await getServerSession(event);

    if (!session) {
        throw createError({
            status: 400
        });
    }

    const user = await prisma.user.findFirst({
        where: {
            email: session?.user?.email
        }
    });

    await prisma.template.create({
        data: {
            userId: user!.id,
            name,
            description,
            isPublic: isPublic === 1 ? true : false,
            cover: coverUrl,
            items: filesUrls
        }
    });
});
