import { generateJSON } from "./openai-client"
import {
  brandArchetypePrompt,
  goldenCirclePrompt,
  brandPositioningPrompt,
  brandVoicePrompt,
  brandStoryPrompt,
  visualIdentityPrompt,
  competitorAnalysisPrompt,
  brandEcosystemPrompt,
  type CompanyData,
} from "./branding-prompts"

export interface BrandReportResult {
  brandArchetype: unknown
  brandPurpose: unknown
  brandPositioning: unknown
  brandVoice: unknown
  brandStory: unknown
  visualIdentity: unknown
  competitorAnalysis: unknown
  brandEcosystem: unknown
}

type ReportSection = keyof BrandReportResult

interface GenerationProgress {
  section: ReportSection
  status: "generating" | "completed" | "failed"
  progress: number
}

export async function generateBrandReport(
  company: CompanyData,
  onProgress?: (progress: GenerationProgress) => void
): Promise<BrandReportResult> {
  const sections: Array<{
    key: ReportSection
    promptFn: (data: CompanyData) => { system: string; user: string }
  }> = [
    { key: "brandArchetype", promptFn: brandArchetypePrompt },
    { key: "brandPurpose", promptFn: goldenCirclePrompt },
    { key: "brandPositioning", promptFn: brandPositioningPrompt },
    { key: "brandVoice", promptFn: brandVoicePrompt },
    { key: "brandStory", promptFn: brandStoryPrompt },
    { key: "visualIdentity", promptFn: visualIdentityPrompt },
    { key: "competitorAnalysis", promptFn: competitorAnalysisPrompt },
    { key: "brandEcosystem", promptFn: brandEcosystemPrompt },
  ]

  // Run all sections in parallel for maximum speed
  const results = await Promise.allSettled(
    sections.map(async ({ key, promptFn }) => {
      const { system, user } = promptFn(company)
      onProgress?.({ section: key, status: "generating", progress: 0 })
      try {
        const data = await generateJSON(system, user, { temperature: 0.6, maxTokens: 2000 })
        onProgress?.({ section: key, status: "completed", progress: 100 })
        return { key, data }
      } catch (error) {
        console.error(`Failed to generate ${key}:`, error)
        onProgress?.({ section: key, status: "failed", progress: 100 })
        return { key, data: { error: `Failed to generate ${key}`, details: String(error) } }
      }
    })
  )

  const result: Partial<BrandReportResult> = {}
  for (const entry of results) {
    if (entry.status === "fulfilled") {
      result[entry.value.key] = entry.value.data
    }
  }

  return result as BrandReportResult
}

export async function regenerateSection(company: CompanyData, section: ReportSection): Promise<unknown> {
  const promptMap: Record<ReportSection, (data: CompanyData) => { system: string; user: string }> = {
    brandArchetype: brandArchetypePrompt,
    brandPurpose: goldenCirclePrompt,
    brandPositioning: brandPositioningPrompt,
    brandVoice: brandVoicePrompt,
    brandStory: brandStoryPrompt,
    visualIdentity: visualIdentityPrompt,
    competitorAnalysis: competitorAnalysisPrompt,
    brandEcosystem: brandEcosystemPrompt,
  }

  const promptFn = promptMap[section]
  if (!promptFn) throw new Error(`Unknown section: ${section}`)

  const { system, user } = promptFn(company)
  return generateJSON(system, user, { temperature: 0.7, maxTokens: 2000 })
}
