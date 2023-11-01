import { getServerSession } from "#auth";
import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);

    const user = await prisma.user.findUnique({
        where: {
            email: session?.user?.email!
        }
    });

    const rankings = await prisma.ranking.findMany({
        where: {
            userId: user?.id
        },

        orderBy: { createdAt: "desc" }
    });

    return rankings;
});
