import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/db"
import authConfig from "./auth.config"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    ...authConfig,
    providers: [
        ...authConfig.providers.filter(p => (p as any).id !== 'credentials'),
        Credentials({
            name: "Demo Account",
            credentials: {
                email: { label: "Email", type: "email" },
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;

                let user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email: credentials.email as string,
                            name: "Demo User",
                        },
                    });
                }

                return user;
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token?.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
    },
})
