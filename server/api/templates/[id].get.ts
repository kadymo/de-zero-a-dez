import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);

    const template = await prisma.template.findUnique({
        where: { id }
    });

    return template;
});
