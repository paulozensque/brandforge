import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const reports = await prisma.brandReport.findMany({
      orderBy: { createdAt: "desc" },
      include: { company: { select: { name: true, industry: true } } },
    })
    return NextResponse.json({ reports })
  } catch (error) {
    return NextResponse.json({ reports: [] })
  }
}
