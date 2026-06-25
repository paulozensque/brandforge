import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateBrandReport } from "@/lib/ai/branding-engine"
import { fullIntakeSchema } from "@/lib/validations/intake"
import type { CompanyData } from "@/lib/ai/branding-prompts"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validationResult = fullIntakeSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: "Dados invalidos", details: validationResult.error.flatten() }, { status: 400 })
    }

    const data = validationResult.data
    const userId = "demo-user"

    const company = await prisma.company.create({
      data: {
        userId, name: data.name, industry: data.industry, segment: data.segment || null,
        website: data.website || null, teamSize: data.teamSize || null, location: data.location || null,
        mission: data.mission || null, vision: data.vision || null, purpose: data.purpose || null,
        values: data.values, differentials: data.differentials, targetAudience: data.targetAudience,
        mainCompetitors: data.mainCompetitors, marketPosition: data.marketPosition || null,
        priceRange: data.priceRange || null, brandTone: data.brandTone, brandKeywords: data.brandKeywords,
        inspirations: data.inspirations, avoidWords: data.avoidWords,
        currentProblems: data.currentProblems || null, goals: data.goals, timeline: data.timeline || null,
      },
    })

    const report = await prisma.brandReport.create({ data: { companyId: company.id, status: "GENERATING" } })

    const companyData: CompanyData = {
      name: data.name, industry: data.industry, segment: data.segment, mission: data.mission,
      vision: data.vision, purpose: data.purpose, values: data.values, differentials: data.differentials,
      targetAudience: data.targetAudience, mainCompetitors: data.mainCompetitors,
      marketPosition: data.marketPosition, priceRange: data.priceRange, brandTone: data.brandTone,
      brandKeywords: data.brandKeywords, inspirations: data.inspirations, avoidWords: data.avoidWords,
      currentProblems: data.currentProblems, goals: data.goals,
    }

    try {
      const reportData = await generateBrandReport(companyData)
      await prisma.brandReport.update({
        where: { id: report.id },
        data: {
          status: "COMPLETED",
          brandArchetype: reportData.brandArchetype as any,
          brandPurpose: reportData.brandPurpose as any,
          brandPositioning: reportData.brandPositioning as any,
          brandVoice: reportData.brandVoice as any,
          brandStory: reportData.brandStory as any,
          visualIdentity: reportData.visualIdentity as any,
          competitorAnalysis: reportData.competitorAnalysis as any,
          brandEcosystem: reportData.brandEcosystem as any,
        },
      })
    } catch (aiError) {
      console.error("AI generation failed:", aiError)
      await prisma.brandReport.update({ where: { id: report.id }, data: { status: "FAILED" } })
    }

    return NextResponse.json({ reportId: report.id, companyId: company.id, status: "GENERATING" })
  } catch (error) {
    console.error("Error in generate route:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
