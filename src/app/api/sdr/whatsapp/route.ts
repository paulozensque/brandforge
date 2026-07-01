import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

async function getCompanyId() {
  let company = await prisma.companyTenant.findFirst()
  if (!company) {
    company = await prisma.companyTenant.create({ data: { name: "Minha Empresa" } })
  }
  return company.id
}

// GET: status da conexão
export async function GET() {
  try {
    const companyId = await getCompanyId()
    const instanceName = `eco-${companyId.substring(0, 8)}`
    const EVO_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080"
    const EVO_KEY = process.env.EVOLUTION_API_KEY || "zen-power-evo-key-2024"

    // Check real status from Evolution API
    try {
      const res = await fetch(`${EVO_URL}/instance/connectionState/${instanceName}`, {
        headers: { apikey: EVO_KEY },
      })
      if (res.ok) {
        const data = await res.json()
        const state = data?.instance?.state || data?.state
        if (state === "open") {
          await prisma.whatsappSession.upsert({
            where: { companyId },
            update: { status: "CONNECTED", qrCode: null },
            create: { companyId, status: "CONNECTED" },
          })
          const session = await prisma.whatsappSession.findUnique({ where: { companyId } })
          return NextResponse.json({ ...session, status: "CONNECTED" })
        }
      }
    } catch {}

    let session = await prisma.whatsappSession.findUnique({ where: { companyId } })
    if (!session) {
      session = await prisma.whatsappSession.create({
        data: { companyId, status: "DISCONNECTED" },
      })
    }
    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}

// POST: ações (connect, disconnect, simulate)
export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()

    const EVO_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080"
    const EVO_KEY = process.env.EVOLUTION_API_KEY || "zen-power-evo-key-2024"

    if (body.action === "connect") {
      // Create instance in Evolution API
      const instanceName = `eco-${companyId.substring(0, 8)}`

      try {
        // Try to create instance
        const createRes = await fetch(`${EVO_URL}/instance/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: EVO_KEY },
          body: JSON.stringify({
            instanceName,
            integration: "WHATSAPP-BAILEYS",
            qrcode: true,
          }),
        })
        const createData = await createRes.json()

        // Get QR code
        const qrCode = createData?.qrcode?.base64 || createData?.instance?.qrcode || null

        const session = await prisma.whatsappSession.upsert({
          where: { companyId },
          update: { status: qrCode ? "WAITING_QR" : "DISCONNECTED", qrCode },
          create: { companyId, status: qrCode ? "WAITING_QR" : "DISCONNECTED", qrCode },
        })

        // If no QR from create, try connecting the instance
        if (!qrCode) {
          const connectRes = await fetch(`${EVO_URL}/instance/connect/${instanceName}`, {
            method: "GET",
            headers: { apikey: EVO_KEY },
          })
          const connectData = await connectRes.json()
          const qr = connectData?.base64 || connectData?.qrcode?.base64 || null

          if (qr) {
            await prisma.whatsappSession.update({
              where: { companyId },
              data: { status: "WAITING_QR", qrCode: qr },
            })
            return NextResponse.json({ ...session, status: "WAITING_QR", qrCode: qr })
          }
        }

        return NextResponse.json(session)
      } catch (evoError: any) {
        console.error("Evolution API error:", evoError?.message || evoError)
        // Fallback: update status in DB
        const session = await prisma.whatsappSession.upsert({
          where: { companyId },
          update: { status: "ERROR" },
          create: { companyId, status: "ERROR" },
        })
        return NextResponse.json({ ...session, error: "Erro ao conectar com Evolution API" })
      }
    }

    if (body.action === "disconnect") {
      const session = await prisma.whatsappSession.update({
        where: { companyId },
        data: { status: "DISCONNECTED", qrCode: null, phoneNumber: null },
      })
      return NextResponse.json(session)
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
