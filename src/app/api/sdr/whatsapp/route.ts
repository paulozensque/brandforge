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
    if (process.env.EVOLUTION_API_URL) {
      try {
        const res = await fetch(`${EVO_URL}/instance/connectionState/${instanceName}`, {
          headers: { apikey: EVO_KEY },
          signal: AbortSignal.timeout(8000),
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
    }

    let session = await prisma.whatsappSession.findUnique({ where: { companyId } })
    if (!session) {
      session = await prisma.whatsappSession.create({
        data: { companyId, status: "DISCONNECTED" },
      })
    }
    return NextResponse.json(session)
  } catch (error: any) {
    console.error("WhatsApp GET error:", error?.message)
    return NextResponse.json({ error: "Erro interno", details: error?.message }, { status: 500 })
  }
}

// POST: ações (connect, disconnect)
export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()

    const EVO_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080"
    const EVO_KEY = process.env.EVOLUTION_API_KEY || "zen-power-evo-key-2024"

    if (body.action === "connect") {
      // Check if Evolution API URL is configured
      if (!process.env.EVOLUTION_API_URL) {
        const session = await prisma.whatsappSession.upsert({
          where: { companyId },
          update: { status: "ERROR" },
          create: { companyId, status: "ERROR" },
        })
        return NextResponse.json({ 
          ...session, 
          status: "ERROR",
          error: "Evolution API não configurada. Adicione EVOLUTION_API_URL nas variáveis de ambiente do Vercel." 
        })
      }

      // Test connectivity first
      try {
        const testRes = await fetch(`${EVO_URL}/instance/fetchInstances`, {
          headers: { apikey: EVO_KEY },
          signal: AbortSignal.timeout(10000),
        })
        if (!testRes.ok && testRes.status >= 500) {
          const session = await prisma.whatsappSession.upsert({
            where: { companyId },
            update: { status: "ERROR" },
            create: { companyId, status: "ERROR" },
          })
          return NextResponse.json({ 
            ...session, 
            status: "ERROR",
            error: `Evolution API offline (status ${testRes.status}). URL: ${EVO_URL}` 
          })
        }
      } catch (connError: any) {
        const session = await prisma.whatsappSession.upsert({
          where: { companyId },
          update: { status: "ERROR" },
          create: { companyId, status: "ERROR" },
        })
        return NextResponse.json({ 
          ...session, 
          status: "ERROR",
          error: `Não foi possível conectar à Evolution API (${EVO_URL}). Erro: ${connError?.message || "timeout"}` 
        })
      }

      // Create or connect instance
      const instanceName = `eco-${companyId.substring(0, 8)}`
      const webhookUrl = process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/sdr/whatsapp/webhook`
        : `${process.env.NEXTAUTH_URL || "https://brandforge-xenr.vercel.app"}/api/sdr/whatsapp/webhook`

      try {
        // First try to connect existing instance
        const connectRes = await fetch(`${EVO_URL}/instance/connect/${instanceName}`, {
          method: "GET",
          headers: { apikey: EVO_KEY },
          signal: AbortSignal.timeout(15000),
        })
        
        if (connectRes.ok) {
          const connectData = await connectRes.json()
          const qr = extractQrCode(connectData)
          
          if (qr) {
            await prisma.whatsappSession.upsert({
              where: { companyId },
              update: { status: "WAITING_QR", qrCode: qr },
              create: { companyId, status: "WAITING_QR", qrCode: qr },
            })
            return NextResponse.json({ status: "WAITING_QR", qrCode: qr })
          }
          
          // Check if already connected
          const state = connectData?.instance?.state || connectData?.state
          if (state === "open") {
            await prisma.whatsappSession.upsert({
              where: { companyId },
              update: { status: "CONNECTED", qrCode: null },
              create: { companyId, status: "CONNECTED" },
            })
            return NextResponse.json({ status: "CONNECTED" })
          }
        }

        // Instance doesn't exist, create it
        const createRes = await fetch(`${EVO_URL}/instance/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: EVO_KEY },
          signal: AbortSignal.timeout(15000),
          body: JSON.stringify({
            instanceName,
            integration: "WHATSAPP-BAILEYS",
            qrcode: true,
            webhook: {
              url: webhookUrl,
              byEvents: true,
              base64: true,
              events: [
                "MESSAGES_UPSERT",
                "CONNECTION_UPDATE",
                "QRCODE_UPDATED",
              ],
            },
          }),
        })
        
        const createData = await createRes.json()
        
        if (!createRes.ok) {
          // If instance already exists, try connecting again
          if (createData?.message?.includes?.("already") || createData?.error?.includes?.("already") || createRes.status === 403) {
            const retryConnect = await fetch(`${EVO_URL}/instance/connect/${instanceName}`, {
              method: "GET",
              headers: { apikey: EVO_KEY },
              signal: AbortSignal.timeout(15000),
            })
            if (retryConnect.ok) {
              const retryData = await retryConnect.json()
              const qr = extractQrCode(retryData)
              if (qr) {
                await prisma.whatsappSession.upsert({
                  where: { companyId },
                  update: { status: "WAITING_QR", qrCode: qr },
                  create: { companyId, status: "WAITING_QR", qrCode: qr },
                })
                return NextResponse.json({ status: "WAITING_QR", qrCode: qr })
              }
            }
          }
          
          // Return error with debug info
          const session = await prisma.whatsappSession.upsert({
            where: { companyId },
            update: { status: "ERROR" },
            create: { companyId, status: "ERROR" },
          })
          return NextResponse.json({ 
            ...session, 
            status: "ERROR",
            error: `Erro da Evolution API: ${JSON.stringify(createData).substring(0, 200)}` 
          })
        }

        // Extract QR code from create response
        const qrCode = extractQrCode(createData)

        if (qrCode) {
          await prisma.whatsappSession.upsert({
            where: { companyId },
            update: { status: "WAITING_QR", qrCode },
            create: { companyId, status: "WAITING_QR", qrCode },
          })
          return NextResponse.json({ status: "WAITING_QR", qrCode })
        }

        // QR not in create response, try connect endpoint
        const connectAfterCreate = await fetch(`${EVO_URL}/instance/connect/${instanceName}`, {
          method: "GET",
          headers: { apikey: EVO_KEY },
          signal: AbortSignal.timeout(15000),
        })
        
        if (connectAfterCreate.ok) {
          const connectData2 = await connectAfterCreate.json()
          const qr2 = extractQrCode(connectData2)
          if (qr2) {
            await prisma.whatsappSession.upsert({
              where: { companyId },
              update: { status: "WAITING_QR", qrCode: qr2 },
              create: { companyId, status: "WAITING_QR", qrCode: qr2 },
            })
            return NextResponse.json({ status: "WAITING_QR", qrCode: qr2 })
          }
        }

        // No QR code obtained - return debug info
        const session = await prisma.whatsappSession.upsert({
          where: { companyId },
          update: { status: "WAITING_QR", qrCode: null },
          create: { companyId, status: "WAITING_QR" },
        })
        return NextResponse.json({ 
          ...session, 
          status: "WAITING_QR",
          debug: `Instance criada mas QR não retornado. Response: ${JSON.stringify(createData).substring(0, 300)}` 
        })

      } catch (evoError: any) {
        console.error("Evolution API error:", evoError?.message || evoError)
        const session = await prisma.whatsappSession.upsert({
          where: { companyId },
          update: { status: "ERROR" },
          create: { companyId, status: "ERROR" },
        })
        return NextResponse.json({ 
          ...session, 
          status: "ERROR",
          error: `Erro ao conectar: ${evoError?.message || "unknown"}` 
        })
      }
    }

    if (body.action === "disconnect") {
      const instanceName = `eco-${companyId.substring(0, 8)}`
      
      // Try to logout/delete from Evolution API
      try {
        await fetch(`${EVO_URL}/instance/logout/${instanceName}`, {
          method: "DELETE",
          headers: { apikey: EVO_KEY },
          signal: AbortSignal.timeout(5000),
        })
      } catch {}

      const session = await prisma.whatsappSession.update({
        where: { companyId },
        data: { status: "DISCONNECTED", qrCode: null, phoneNumber: null },
      })
      return NextResponse.json(session)
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
  } catch (error: any) {
    console.error("WhatsApp POST error:", error?.message)
    return NextResponse.json({ error: "Erro interno", details: error?.message }, { status: 500 })
  }
}

// Helper: extract QR code from various Evolution API response formats
function extractQrCode(data: any): string | null {
  if (!data) return null
  
  // Direct base64 in response
  if (data.base64) return data.base64
  
  // Nested in qrcode object
  if (data.qrcode?.base64) return data.qrcode.base64
  if (data.qrcode?.pairingCode) return null // pairing code, not QR
  if (typeof data.qrcode === "string" && data.qrcode.length > 50) return data.qrcode
  
  // Nested in instance object
  if (data.instance?.qrcode) return data.instance.qrcode
  
  // In hash/code format (Evolution API v2)
  if (data.code && typeof data.code === "string" && data.code.length > 50) return data.code
  
  // Check nested deeper
  if (data.data?.qrcode?.base64) return data.data.qrcode.base64
  if (data.data?.base64) return data.data.base64
  
  return null
}
