import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { NuxtAuthHandler } from "#auth";
import { prisma } from "@/server/lib/prisma";

export default NuxtAuthHandler({
    pages: { signIn: "/" },
    secret: process.env.NUXT_GOOGLE_AUTH_SECRET,
    adapter: PrismaAdapter(prisma),

    providers: [
        // @ts-expect-error
        GoogleProvider.default({
            clientId: process.env.NUXT_GOOGLE_CLIENT_ID,
            clientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET
        })
    ]
});
