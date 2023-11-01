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
            email: session.user?.email
        }
    });

    const templates = await prisma.template.findMany({
        where: {
            userId: user!.id
        }
    });

    return templates;
});
