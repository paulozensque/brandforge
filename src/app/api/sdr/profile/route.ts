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
    let profile = await prisma.companyProfile.findUnique({ where: { companyId } })
    if (!profile) {
      profile = await prisma.companyProfile.create({ data: { companyId } })
    }
    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()

    // Calculate completion score
    const fields = Object.entries(body).filter(([k]) => k !== "id" && k !== "companyId" && k !== "createdAt" && k !== "updatedAt" && k !== "profileCompletionScore")
    const filled = fields.filter(([_, v]) => v && String(v).trim().length > 0).length
    const total = fields.length
    const profileCompletionScore = Math.round((filled / total) * 100)

    const profile = await prisma.companyProfile.upsert({
      where: { companyId },
      update: { ...body, profileCompletionScore },
      create: { companyId, ...body, profileCompletionScore },
    })
    return NextResponse.json(profile)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}
