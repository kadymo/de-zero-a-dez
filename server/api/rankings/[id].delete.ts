import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);

  await prisma.ranking.delete({
    where: { id }
  });
});
