import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const report = await prisma.marketReport.findUnique({
      where: { id: params.id },
      include: { company: true },
    })
    if (!report) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json(report)
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
