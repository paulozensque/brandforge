import { generateJSON } from "../openai-client"
import {
  buyingPersonasPrompt,
  empathyMapPrompt,
  swotAnalysisPrompt,
  tamSamSomPrompt,
  marketingStrategiesPrompt,
  psychologyContentPrompt,
  productMarketFitPrompt,
  creativeDataBriefPrompt,
  type MarketInputData,
} from "./market-prompts"

export interface MarketReportResult {
  buyingPersonas: unknown
  empathyMap: unknown
  swotAnalysis: unknown
  tamSamSom: unknown
  marketingStrategies: unknown
  psychologyContent: unknown
  productMarketFit: unknown
  creativeDataBrief: unknown
}

type MarketSection = keyof MarketReportResult

interface GenerationProgress {
  section: MarketSection
  status: "generating" | "completed" | "failed"
  progress: number
}

export async function generateMarketReport(
  data: MarketInputData,
  onProgress?: (progress: GenerationProgress) => void
): Promise<MarketReportResult> {
  const sections: Array<{
    key: MarketSection
    promptFn: (d: MarketInputData) => { system: string; user: string }
  }> = [
    { key: "buyingPersonas", promptFn: buyingPersonasPrompt },
    { key: "empathyMap", promptFn: empathyMapPrompt },
    { key: "swotAnalysis", promptFn: swotAnalysisPrompt },
    { key: "tamSamSom", promptFn: tamSamSomPrompt },
    { key: "marketingStrategies", promptFn: marketingStrategiesPrompt },
    { key: "psychologyContent", promptFn: psychologyContentPrompt },
    { key: "productMarketFit", promptFn: productMarketFitPrompt },
    { key: "creativeDataBrief", promptFn: creativeDataBriefPrompt },
  ]

  const result: Partial<MarketReportResult> = {}
  const totalSections = sections.length

  for (let i = 0; i < sections.length; i++) {
    const { key, promptFn } = sections[i]
    const { system, user } = promptFn(data)

    onProgress?.({
      section: key,
      status: "generating",
      progress: Math.round((i / totalSections) * 100),
    })

    try {
      const responseData = await generateJSON(system, user, {
        temperature: 0.6,
        maxTokens: 4000,
      })
      result[key] = responseData
      onProgress?.({
        section: key,
        status: "completed",
        progress: Math.round(((i + 1) / totalSections) * 100),
      })
    } catch (error) {
      console.error(`Failed to generate ${key}:`, error)
      result[key] = { error: `Failed to generate ${key}`, details: String(error) }
      onProgress?.({
        section: key,
        status: "failed",
        progress: Math.round(((i + 1) / totalSections) * 100),
      })
    }
  }

  return result as MarketReportResult
}
