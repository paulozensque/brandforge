import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths - don't redirect
  const publicPaths = ["/login", "/api/auth", "/api/sdr/whatsapp/webhook"]
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check for session token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // If no token and trying to access protected route, redirect to login
  if (!token && !pathname.startsWith("/api/")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
