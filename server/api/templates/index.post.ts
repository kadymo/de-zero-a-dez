import { getServerSession } from "#auth";
import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const { name, description, isPublic, coverUrl, filesUrls } = await readBody(event);

    await prisma.template.create({
        data: {
            userId: "clnl50ciz000077myroqifjmq",
            name,
            description,
            isPublic: isPublic === 1 ? true : false,
            cover: coverUrl,
            items: filesUrls
        }
    });
});
