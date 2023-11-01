import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
    const { search } = getQuery(event);

    const templates = await prisma.template.findMany({
        where: {
            name: {
                contains: search as string,
                mode: "insensitive"
            },

            isPublic: true
        },
        orderBy: { createdAt: "asc" }
    });

    return templates;
});
