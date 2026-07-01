import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

async function getCompanyId() {
  let company = await prisma.companyTenant.findFirst()
  if (!company) {
    company = await prisma.companyTenant.create({ data: { name: "Minha Empresa" } })
  }
  return company.id
}

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const where: any = { companyId }
    if (status) where.status = status

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        conversations: { take: 1, orderBy: { updatedAt: "desc" } },
        meetings: { take: 1, orderBy: { date: "desc" } },
      },
    })
    return NextResponse.json(leads)
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()
    const lead = await prisma.lead.create({
      data: { companyId, phone: body.phone, name: body.name, ...body },
    })
    return NextResponse.json(lead)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar lead" }, { status: 500 })
  }
}
