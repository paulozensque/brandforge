import { NextRequest, NextResponse } from "next/server"
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
    let config = await prisma.calendarConfig.findUnique({ where: { companyId } })
    if (!config) {
      config = await prisma.calendarConfig.create({ data: { companyId } })
    }
    const meetings = await prisma.meeting.findMany({
      where: { companyId },
      orderBy: { date: "asc" },
      include: { lead: true },
    })
    return NextResponse.json({ config, meetings })
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()
    const config = await prisma.calendarConfig.upsert({
      where: { companyId },
      update: body,
      create: { companyId, ...body },
    })
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}
