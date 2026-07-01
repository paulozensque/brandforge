import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        conversations: { include: { messages: { orderBy: { createdAt: "asc" } } } },
        scores: true,
        meetings: true,
      },
    })
    if (!lead) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 })
    return NextResponse.json(lead)
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(lead)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}
