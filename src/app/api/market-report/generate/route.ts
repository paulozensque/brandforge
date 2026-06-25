import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateMarketReport } from "@/lib/ai/market/market-engine"
import type { MarketInputData } from "@/lib/ai/market/market-prompts"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { companyId } = body

    if (!companyId) {
      return NextResponse.json({ error: "companyId obrigatorio" }, { status: 400 })
    }

    // Fetch company data + brand report data from SaaS 1
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        brandReports: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: "Empresa nao encontrada" }, { status: 404 })
    }

    // Create market report record
    const marketReport = await prisma.marketReport.create({
      data: { companyId: company.id, status: "GENERATING" },
    })

    // Build input data combining company info + brand report insights
    const brandReport = company.brandReports[0]
    const brandData = brandReport ? {
      brandArchetype: JSON.stringify((brandReport.brandArchetype as any)?.primaryArchetype?.name || ""),
      brandPositioning: JSON.stringify((brandReport.brandPositioning as any)?.positioningStatement || ""),
      brandVoice: JSON.stringify((brandReport.brandVoice as any)?.voiceAttributes?.[0]?.attribute || ""),
      brandStory: JSON.stringify((brandReport.brandStory as any)?.storyBrandFramework?.hero || ""),
    } : {}

    const marketInput: MarketInputData = {
      name: company.name,
      industry: company.industry,
      segment: company.segment || undefined,
      mission: company.mission || undefined,
      vision: company.vision || undefined,
      purpose: company.purpose || undefined,
      values: company.values,
      differentials: company.differentials,
      targetAudience: company.targetAudience || undefined,
      mainCompetitors: company.mainCompetitors,
      marketPosition: company.marketPosition || undefined,
      priceRange: company.priceRange || undefined,
      brandTone: company.brandTone,
      brandKeywords: company.brandKeywords,
      inspirations: company.inspirations,
      avoidWords: company.avoidWords,
      currentProblems: company.currentProblems || undefined,
      goals: company.goals || undefined,
      ...brandData,
    }

    // Generate report async
    try {
      const reportData = await generateMarketReport(marketInput)

      await prisma.marketReport.update({
        where: { id: marketReport.id },
        data: {
          status: "COMPLETED",
          data: reportData as any,
        },
      })
    } catch (aiError) {
      console.error("Market report AI generation failed:", aiError)
      await prisma.marketReport.update({
        where: { id: marketReport.id },
        data: { status: "FAILED" },
      })
    }

    return NextResponse.json({
      reportId: marketReport.id,
      companyId: company.id,
      status: "GENERATING",
    })
  } catch (error) {
    console.error("Error in market generate route:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
