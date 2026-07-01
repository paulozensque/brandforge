import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        lead: true,
        messages: { orderBy: { createdAt: "asc" } },
      },
    })
    if (!conversation) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
    return NextResponse.json(conversation)
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
