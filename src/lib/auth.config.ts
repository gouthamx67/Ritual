import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

// This config is edge-compatible (no database adapter here)
export default {
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            name: "Demo Account",
            credentials: {
                email: { label: "Email", type: "email" },
            },
            async authorize(credentials) {
                // We can't use prisma here if we want edge compatibility in middleware.
                // But actually, middleware doesn't call authorize.
                // So we can leave this here and handle it in the main auth.ts
                return null;
            }
        })
    ],
} satisfies NextAuthConfig
