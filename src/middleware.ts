import NextAuth from "next-auth"
import authConfig from "./lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
    const isPublicRoute = nextUrl.pathname.startsWith("/login")

    if (isApiAuthRoute) return undefined

    if (isPublicRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL("/", nextUrl))
        }
        return undefined
    }

    if (!isLoggedIn && !isPublicRoute) {
        return Response.redirect(new URL("/login", nextUrl))
    }

    return undefined
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
