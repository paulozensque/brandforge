import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

async function getCompanyId() {
  let company = await prisma.companyTenant.findFirst()
  if (!company) {
    company = await prisma.companyTenant.create({ data: { name: "Minha Empresa" } })
  }
  return company.id
}

async function sendWhatsAppReply(instanceName: string, phone: string, text: string) {
  const EVO_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080"
  const EVO_KEY = process.env.EVOLUTION_API_KEY || ""
  const remoteJid = phone.includes("@") ? phone : `${phone}@s.whatsapp.net`

  try {
    const res = await fetch(`${EVO_URL}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVO_KEY },
      body: JSON.stringify({ number: remoteJid, text }),
    })
    console.log("Send reply status:", res.status)
  } catch (err) {
    console.error("Error sending reply:", err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Webhook event:", body?.event, "| Data keys:", Object.keys(body || {}))

    const companyId = await getCompanyId()
    const event = body?.event || body?.action || ""

    // Connection status update
    if (event === "connection.update" || event === "CONNECTION_UPDATE") {
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
    if (event === "qrcode.updated" || event === "QRCODE_UPDATED") {
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

    // Incoming message - Evolution API v2 format
    if (event === "messages.upsert" || event === "MESSAGES_UPSERT") {
      // Evolution API v2 sends data as array or object
      let messageData = body?.data
      
      // Handle different formats
      let messageArray: any[] = []
      if (Array.isArray(messageData)) {
        messageArray = messageData
      } else if (messageData && typeof messageData === "object") {
        // Could be a single message object
        if (messageData.key) {
          messageArray = [messageData]
        } else if (messageData.message) {
          messageArray = [messageData]
        }
      }

      console.log(`Processing ${messageArray.length} messages`)

      for (const msg of messageArray) {
        // Skip outgoing messages
        const isFromMe = msg?.key?.fromMe === true
        if (isFromMe) {
          console.log("Skipping outgoing message")
          continue
        }

        // Extract phone number
        const remoteJid = msg?.key?.remoteJid || ""
        // Skip group messages
        if (remoteJid.includes("@g.us")) {
          console.log("Skipping group message")
          continue
        }
        
        const phone = remoteJid.replace("@s.whatsapp.net", "")

        // Extract message text - handle multiple formats
        const text = msg?.message?.conversation ||
                    msg?.message?.extendedTextMessage?.text ||
                    msg?.message?.buttonsResponseMessage?.selectedDisplayText ||
                    msg?.message?.listResponseMessage?.title ||
                    msg?.body ||
                    msg?.text ||
                    ""

        if (!phone || !text) {
          console.log("No phone or text, skipping. Phone:", phone, "Text:", text ? "has text" : "empty")
          continue
        }

        console.log(`Message from ${phone}: ${text.substring(0, 50)}`)

        // Find or create lead
        let lead = await prisma.lead.findFirst({
          where: { companyId, phone },
        })

        if (!lead) {
          // Try to get push name from message
          const pushName = msg?.pushName || msg?.key?.pushName || null
          lead = await prisma.lead.create({
            data: { 
              companyId, 
              phone, 
              whatsapp: phone, 
              name: pushName,
              status: "novo_lead", 
              origin: "whatsapp" 
            },
          })
          console.log(`Created new lead: ${lead.id} (${pushName || phone})`)
        }

        // Update lead status
        if (lead.status === "novo_lead") {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { status: "em_atendimento" },
          })
        }

        // Update lead name if we have pushName and lead has no name
        if (!lead.name && msg?.pushName) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { name: msg.pushName },
          })
        }

        // Find or create conversation
        let conversation = await prisma.conversation.findFirst({
          where: { leadId: lead.id, status: "ACTIVE" },
        })

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: { companyId, leadId: lead.id, status: "ACTIVE" },
          })
          console.log(`Created new conversation: ${conversation.id}`)
        }

        // Save the incoming message
        await prisma.message.create({
          data: { conversationId: conversation.id, role: "USER", content: text },
        })

        // Update lead last message
        await prisma.lead.update({
          where: { id: lead.id },
          data: { lastMessage: text, updatedAt: new Date() },
        })

        // Log activity
        await prisma.activityLog.create({
          data: {
            companyId,
            type: "message_received",
            message: `Mensagem de ${lead.name || phone}: "${text.substring(0, 50)}"`,
          },
        })

        // Generate AI response (SDR)
        try {
          const [settings, profile, messages] = await Promise.all([
            prisma.aiSettings.findUnique({ where: { companyId } }),
            prisma.companyProfile.findUnique({ where: { companyId } }),
            prisma.message.findMany({
              where: { conversationId: conversation.id },
              orderBy: { createdAt: "asc" },
              take: 20,
            }),
          ])

          // Build AI prompt
          const aiName = settings?.aiName || "Assistente"
          const tone = settings?.tone || "Consultivo, profissional e objetivo"
          const segment = settings?.segment || profile?.description || "serviços"
          const products = settings?.products || profile?.services || ""

          const systemPrompt = `Você é ${aiName}, um SDR (Sales Development Representative) inteligente.
Seu tom é: ${tone}. Segmento: ${segment}.
Produtos/Serviços: ${products}.

FLUXO:
1. Saudação breve e natural
2. Entender necessidade do lead
3. Fazer perguntas classificatórias (uma por vez)
4. Sugerir próximo passo (reunião/demonstração)

REGRAS:
- Máximo 2-3 frases por mensagem
- Seja humano e consultivo
- Faça UMA pergunta por vez
- Busque o próximo passo comercial
- Responda em português do Brasil
- NÃO use prefixos como "SDR:" ou "Assistente:"
- Apenas o texto da resposta`

          const history = messages.map((m) => 
            `${m.role === "USER" ? "Lead" : "Assistente"}: ${m.content}`
          ).join("\n")

          const { generateCompletion } = await import("@/lib/ai/openai-client")
          const aiResponse = await generateCompletion(systemPrompt, history, {
            temperature: 0.7,
            maxTokens: 300,
          })

          const cleanResponse = aiResponse.replace(/^(SDR|Assistente|Assistant):\s*/i, "").trim()

          // Save AI response
          await prisma.message.create({
            data: { conversationId: conversation.id, role: "ASSISTANT", content: cleanResponse },
          })

          // Send via WhatsApp
          const instanceName = `eco-${companyId.substring(0, 8)}`
          await sendWhatsAppReply(instanceName, phone, cleanResponse)

          console.log(`AI replied to ${phone}: ${cleanResponse.substring(0, 50)}...`)
        } catch (aiError: any) {
          console.error("AI Error:", aiError?.message || aiError)
          // Still save that we received the message, just don't reply
        }
      }

      return NextResponse.json({ ok: true })
    }

    // Other events
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Webhook error:", error?.message || error)
    return NextResponse.json({ ok: true }) // Always 200 to avoid retries
  }
}

// GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: "webhook active" })
}
