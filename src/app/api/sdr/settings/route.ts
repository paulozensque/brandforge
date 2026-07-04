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
    // Remove non-model fields
    const { id, createdAt, updatedAt, company, ...data } = body
    const settings = await prisma.aiSettings.upsert({
      where: { companyId },
      update: data,
      create: { companyId, ...data },
    })
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()
    // Remove non-model fields
    const { id, createdAt, updatedAt, company, companyId: _, ...data } = body
    const settings = await prisma.aiSettings.upsert({
      where: { companyId },
      update: data,
      create: { companyId, ...data },
    })
    return NextResponse.json(settings)
  } catch (error: any) {
    console.error("Settings save error:", error?.message)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}
