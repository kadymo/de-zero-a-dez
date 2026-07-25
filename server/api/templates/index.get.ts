import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const search = (query.search as string) || "";
    const page = Math.max(1, parseInt((query.page as string) || "1", 10));
    const limit = Math.max(1, parseInt((query.limit as string) || "15", 10));
    const skip = (page - 1) * limit;

    const where = {
        name: {
            contains: search,
            mode: "insensitive" as const
        },
        isPublic: true
    };

    const [templates, total] = await Promise.all([
        prisma.template.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                },
                _count: {
                    select: {
                        rankings: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        }),
        prisma.template.count({ where })
    ]);

    return {
        templates,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
});

