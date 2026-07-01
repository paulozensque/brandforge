import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

async function getCompanyId() {
  let company = await prisma.companyTenant.findFirst()
  if (!company) {
    company = await prisma.companyTenant.create({ data: { name: "Minha Empresa" } })
  }
  return company.id
}

export async function GET() {
  try {
    const companyId = await getCompanyId()

    const [totalLeads, hotLeads, warmLeads, coldLeads, meetings, activeConversations, whatsapp] = await Promise.all([
      prisma.lead.count({ where: { companyId } }),
      prisma.lead.count({ where: { companyId, classification: "HOT" } }),
      prisma.lead.count({ where: { companyId, classification: "WARM" } }),
      prisma.lead.count({ where: { companyId, classification: "COLD" } }),
      prisma.meeting.count({ where: { companyId, status: "SCHEDULED" } }),
      prisma.conversation.count({ where: { companyId, status: "ACTIVE" } }),
      prisma.whatsappSession.findUnique({ where: { companyId } }),
    ])

    const qualificationRate = totalLeads > 0 ? Math.round((hotLeads + warmLeads) / totalLeads * 100) : 0
    const schedulingRate = totalLeads > 0 ? Math.round(meetings / totalLeads * 100) : 0

    return NextResponse.json({
      totalLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      meetings,
      activeConversations,
      qualificationRate,
      schedulingRate,
      whatsappStatus: whatsapp?.status || "DISCONNECTED",
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
