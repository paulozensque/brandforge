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
    let settings = await prisma.aiSettings.findUnique({ where: { companyId } })
    if (!settings) {
      settings = await prisma.aiSettings.create({ data: { companyId } })
    }
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()
    const settings = await prisma.aiSettings.upsert({
      where: { companyId },
      update: body,
      create: { companyId, ...body },
    })
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}
