import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

async function getCompanyId() {
  let company = await prisma.companyTenant.findFirst()
  if (!company) {
    company = await prisma.companyTenant.create({ data: { name: "Minha Empresa" } })
  }
  return company.id
}

export async function POST(req: NextRequest) {
  try {
    const { platform, token, accountId } = await req.json()

    if (!platform || !token || !accountId) {
      return NextResponse.json({ error: "Token e ID da conta são obrigatórios" }, { status: 400 })
    }

    // Validate token by making a test request
    if (platform === "meta") {
      try {
        const res = await fetch(`https://graph.facebook.com/v21.0/${accountId}?fields=name,account_status&access_token=${token}`)
        const data = await res.json()
        if (data.error) {
          return NextResponse.json({ error: `Meta retornou: ${data.error.message}` }, { status: 400 })
        }
        // Token is valid - save
        const companyId = await getCompanyId()
        // Store in activity log (in production: encrypted storage)
        await prisma.activityLog.create({
          data: {
            companyId,
            type: "platform_connected",
            message: `Meta Ads conectado: ${data.name || accountId}`,
            metadata: { platform, accountId, accountName: data.name },
          },
        })
        return NextResponse.json({ success: true, accountName: data.name })
      } catch (e: any) {
        return NextResponse.json({ error: "Não foi possível validar o token Meta" }, { status: 400 })
      }
    }

    if (platform === "google") {
      // Google Ads API requires more setup, save for now
      const companyId = await getCompanyId()
      await prisma.activityLog.create({
        data: {
          companyId,
          type: "platform_connected",
          message: `Google Ads configurado: ${accountId}`,
          metadata: { platform, accountId },
        },
      })
      return NextResponse.json({ success: true })
    }

    if (platform === "tiktok") {
      // Validate TikTok token
      try {
        const res = await fetch(`https://business-api.tiktok.com/open_api/v1.3/advertiser/info/?advertiser_ids=["${accountId}"]`, {
          headers: { "Access-Token": token },
        })
        const data = await res.json()
        if (data.code !== 0) {
          return NextResponse.json({ error: `TikTok retornou: ${data.message}` }, { status: 400 })
        }
        const companyId = await getCompanyId()
        await prisma.activityLog.create({
          data: {
            companyId,
            type: "platform_connected",
            message: `TikTok Ads conectado: ${accountId}`,
            metadata: { platform, accountId },
          },
        })
        return NextResponse.json({ success: true })
      } catch {
        return NextResponse.json({ error: "Não foi possível validar o token TikTok" }, { status: 400 })
      }
    }

    return NextResponse.json({ error: "Plataforma não suportada" }, { status: 400 })
  } catch (error) {
    console.error("Connect platform error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
