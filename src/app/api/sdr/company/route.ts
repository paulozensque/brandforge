import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET: retorna a empresa do demo user (ou cria uma)
export async function GET() {
  try {
    let company = await prisma.companyTenant.findFirst()
    if (!company) {
      company = await prisma.companyTenant.create({
        data: { name: "Minha Empresa" },
      })
      // Create default pipeline stages
      const stages = [
        "Novo Lead", "Em Atendimento", "Qualificado", "Reunião Sugerida",
        "Reunião Agendada", "Proposta Enviada", "Negociação", "Fechado Ganho", "Fechado Perdido"
      ]
      await prisma.pipelineStage.createMany({
        data: stages.map((name, i) => ({ companyId: company!.id, name, order: i })),
      })
    }
    return NextResponse.json(company)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
