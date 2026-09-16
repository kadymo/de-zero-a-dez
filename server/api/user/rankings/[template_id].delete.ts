import { getServerSession } from "#auth";
import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
    const { template_id } = getRouterParams(event);

    const session = await getServerSession(event);
    if (!session?.user?.email) {
        throw createError({
            statusCode: 401,
            statusMessage: "Você precisa estar autenticado para excluir um ranking."
        });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        throw createError({
            statusCode: 404,
            statusMessage: "Usuário não encontrado."
        });
    }

    await prisma.ranking.deleteMany({
        where: {
            userId: user.id,
            templateId: template_id
        }
    });

    return { success: true };
});
