import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { exchangeCodeForTokens } from "@/lib/google-calendar"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state") // companyId
    const error = url.searchParams.get("error")

    if (error) {
      return NextResponse.redirect(new URL("/sdr/agenda?error=access_denied", req.url))
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/sdr/agenda?error=missing_params", req.url))
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Save tokens to CalendarConfig
    await prisma.calendarConfig.upsert({
      where: { companyId: state },
      update: {
        googleConnected: true,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token || undefined,
        googleTokenExpiry: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
      },
      create: {
        companyId: state,
        googleConnected: true,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
      },
    })

    // Redirect back to agenda page with success
    const baseUrl = process.env.NEXTAUTH_URL || "https://brandforge-xenr.vercel.app"
    return NextResponse.redirect(`${baseUrl}/sdr/agenda?connected=true`)
  } catch (error: any) {
    console.error("Calendar callback error:", error?.message)
    const baseUrl = process.env.NEXTAUTH_URL || "https://brandforge-xenr.vercel.app"
    return NextResponse.redirect(`${baseUrl}/sdr/agenda?error=token_exchange`)
  }
}
