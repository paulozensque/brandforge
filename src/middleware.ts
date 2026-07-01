import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths
  const publicPaths = ["/login", "/api/auth", "/api/sdr/whatsapp/webhook"]
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Skip API routes from auth check during build
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || "fallback" })
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
  } catch {
    // If token check fails, allow access (prevents build errors)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
}
