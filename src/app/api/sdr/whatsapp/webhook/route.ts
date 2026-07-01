import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { handleIncomingWhatsApp } from "@/lib/ai/sdr-engine"

async function getCompanyId() {
  let company = await prisma.companyTenant.findFirst()
  if (!company) {
    company = await prisma.companyTenant.create({ data: { name: "Minha Empresa" } })
  }
  return company.id
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Webhook received:", JSON.stringify(body).substring(0, 200))

    const companyId = await getCompanyId()
    const event = body.event || body.action

    // Connection status update
    if (event === "connection.update" || body.event === "connection.update") {
      const state = body?.data?.state || body?.state || body?.data?.instance?.state
      console.log("Connection state:", state)

      if (state === "open" || state === "connected") {
        await prisma.whatsappSession.upsert({
          where: { companyId },
          update: { status: "CONNECTED", qrCode: null },
          create: { companyId, status: "CONNECTED" },
        })
      } else if (state === "close" || state === "disconnected") {
        await prisma.whatsappSession.upsert({
          where: { companyId },
          update: { status: "DISCONNECTED", qrCode: null },
          create: { companyId, status: "DISCONNECTED" },
        })
      }
      return NextResponse.json({ ok: true })
    }

    // QR Code update
    if (event === "qrcode.updated" || body.event === "qrcode.updated") {
      const qr = body?.data?.qrcode?.base64 || body?.qrcode?.base64 || body?.data?.base64
      if (qr) {
        await prisma.whatsappSession.upsert({
          where: { companyId },
          update: { status: "WAITING_QR", qrCode: qr },
          create: { companyId, status: "WAITING_QR", qrCode: qr },
        })
      }
      return NextResponse.json({ ok: true })
    }

    // Incoming message
    if (event === "messages.upsert" || body.event === "messages.upsert") {
      const messages = body?.data || []
      const messageArray = Array.isArray(messages) ? messages : [messages]

      for (const msg of messageArray) {
        // Skip outgoing messages (from us)
        const isFromMe = msg?.key?.fromMe || msg?.fromMe
        if (isFromMe) continue

        const phone = msg?.key?.remoteJid?.replace("@s.whatsapp.net", "") || 
                     msg?.from?.replace("@s.whatsapp.net", "") ||
                     msg?.key?.participant?.replace("@s.whatsapp.net", "")
        
        const text = msg?.message?.conversation ||
                    msg?.message?.extendedTextMessage?.text ||
                    msg?.body ||
                    msg?.text ||
                    ""

        if (!phone || !text) continue

        console.log(`Message from ${phone}: ${text}`)

        // Process with SDR AI
        const EVO_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080"
        const EVO_KEY = process.env.EVOLUTION_API_KEY || "zen-power-evo-key-2024"

        try {
          const response = await handleIncomingWhatsApp(phone, text, companyId)

          // Send reply via Evolution API
          const instanceName = `eco-${companyId.substring(0, 8)}`
          const remoteJid = phone.includes("@") ? phone : `${phone}@s.whatsapp.net`

          await fetch(`${EVO_URL}/message/sendText/${instanceName}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: EVO_KEY },
            body: JSON.stringify({
              number: remoteJid,
              text: response,
            }),
          })

          console.log(`Reply sent to ${phone}: ${response.substring(0, 50)}...`)
        } catch (aiError) {
          console.error("Error processing message:", aiError)
        }
      }

      return NextResponse.json({ ok: true })
    }

    // Other events - just acknowledge
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ ok: true }) // Always return 200 to avoid retries
  }
}

// Also handle GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: "webhook active" })
}
