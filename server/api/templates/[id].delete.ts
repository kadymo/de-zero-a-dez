import { prisma } from "@/server/lib/prisma";

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);

  await prisma.template.delete({
    where: { id }
  });
});
