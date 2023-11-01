import { getServerSession } from "#auth";
import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
    const { templateId, columns } = await readBody(event);

    const session = await getServerSession(event);

    const user = await prisma.user.findUnique({
        where: { id: session?.user?.email! },
        include: { rankings: true }
    });

    const rankingIsAlreadySaved = user?.rankings.find((r) => r.templateId === templateId);

    if (rankingIsAlreadySaved) {
        await prisma.ranking.update({
            where: { id: rankingIsAlreadySaved.id },
            data: {
                columns
            }
        });

        return
    }

    await prisma.ranking.create({
        data: {
            userId: user!.id,
            templateId,
            columns
        }
    });
});
