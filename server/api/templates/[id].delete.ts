import { getServerSession } from "#auth";
import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);

    const session = await getServerSession(event);
    if (!session?.user?.email) {
        throw createError({
            statusCode: 401,
            statusMessage: "Você precisa estar autenticado para excluir um template."
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

    const existingTemplate = await prisma.template.findUnique({
        where: { id }
    });

    if (!existingTemplate) {
        throw createError({
            statusCode: 404,
            statusMessage: "Template não encontrado."
        });
    }

    if (existingTemplate.userId !== user.id) {
        throw createError({
            statusCode: 403,
            statusMessage: "Você não tem permissão para excluir este template."
        });
    }

    // Delete associated user rankings first to prevent foreign key constraints
    await prisma.ranking.deleteMany({
        where: { templateId: id }
    });

    // Delete the template
    await prisma.template.delete({
        where: { id }
    });

    return { success: true };
});
