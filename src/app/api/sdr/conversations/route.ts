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
    const conversations = await prisma.conversation.findMany({
      where: { companyId },
      orderBy: { updatedAt: "desc" },
      include: {
        lead: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    })
    return NextResponse.json(conversations)
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
