import { getServerSession } from "#auth";
import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);

    const user = await prisma.user.findUnique({
        where: {
            email: session?.user?.email!
        }
    });

    const templates = await prisma.template.findMany({
        where: {
            userId: user?.email!
        }
    });

    return templates;
});
