import { getServerSession } from "#auth";
import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
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

    const rankings = await prisma.ranking.findMany({
        where: {
            userId: user?.id
        },

        include: { template: true },

        orderBy: { createdAt: "desc" }
    });

    return rankings;
});
