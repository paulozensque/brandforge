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

// Simula uma mensagem recebida no WhatsApp
export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const { phone, message } = await req.json()

    if (!phone || !message) {
      return NextResponse.json({ error: "phone e message são obrigatórios" }, { status: 400 })
    }

    const response = await handleIncomingWhatsApp(phone, message, companyId)

    return NextResponse.json({ response, phone, originalMessage: message })
  } catch (error) {
    console.error("Simulate error:", error)
    return NextResponse.json({ error: "Erro ao processar mensagem" }, { status: 500 })
  }
}
