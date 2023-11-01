import { getServerSession } from "#auth";
import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
    const { template_id } = getRouterParams(event);

    const session = await getServerSession(event);

    const user = await prisma.user.findUnique({
        where: {
            email: session?.user?.email!
        },
        include: { rankings: true }
    });

    const ranking = user?.rankings.find((r) => r.templateId === template_id);

    await prisma.ranking.delete({
        where: {
            id: ranking?.id
        }
    });
});
