import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateJSON } from "@/lib/ai/openai-client"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.companyName || !body.industry || !body.niche) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    const user = await prisma.user.upsert({
      where: { email: "demo@brandforge.local" },
      update: {},
      create: { id: "demo-user", email: "demo@brandforge.local", name: "Demo User" },
    })

    const company = await prisma.company.create({
      data: {
        userId: user.id,
        name: body.companyName,
        industry: body.industry,
        segment: body.niche,
        targetAudience: body.audienceProfile || null,
        mainCompetitors: body.competitors || [],
        priceRange: body.priceRange || null,
        brandTone: [],
        brandKeywords: body.channels || [],
        values: [],
        differentials: [],
        inspirations: [],
        avoidWords: [],
        goals: body.opportunities || null,
        currentProblems: body.threats || null,
      },
    })

    const report = await prisma.marketReport.create({
      data: { companyId: company.id, status: "GENERATING" },
    })

    const context = `
EMPRESA: ${body.companyName}
INDÚSTRIA: ${body.industry}
NICHO: ${body.niche}
CONCORRENTES: ${(body.competitors || []).join(", ") || "N/A"}
TAMANHO DO MERCADO: ${body.marketSize || "N/A"}
TENDÊNCIAS: ${body.currentTrends || "N/A"}
PÚBLICO: ${body.audienceProfile || "N/A"}
DORES DO MERCADO: ${(body.audiencePains || []).join(", ") || "N/A"}
COMPORTAMENTO DE COMPRA: ${body.audienceBehavior || "N/A"}
FAIXA DE PREÇO: ${body.priceRange || "N/A"}
CANAIS: ${(body.channels || []).join(", ") || "N/A"}
AMEAÇAS: ${body.threats || "N/A"}
OPORTUNIDADES: ${body.opportunities || "N/A"}
`.trim()

    const sections = [
      {
        key: "marketOverview",
        system: `Você é um analista de mercado sênior. Analise o mercado e responda em JSON:
{
  "tamanhoMercado": { "estimativa": "", "crescimentoAnual": "", "tendencia": "" },
  "segmentacao": [{ "segmento": "", "tamanho": "", "oportunidade": "" }],
  "cicloDeVida": "",
  "barreirasEntrada": [],
  "fatoresChave": [],
  "perspectiva5Anos": ""
}`,
        user: `Análise de mercado:\n${context}`,
      },
      {
        key: "competitorAnalysis",
        system: `Você é um especialista em inteligência competitiva. Analise os concorrentes e responda em JSON:
{
  "mapaCompetitivo": [{ "nome": "", "forca": "", "fraqueza": "", "posicionamento": "", "precoEstimado": "" }],
  "lacunasDoMercado": [],
  "estrategiaOceanoAzul": { "eliminar": [], "reduzir": [], "elevar": [], "criar": [] },
  "vantagensCompetitivas": [],
  "comoVencer": []
}`,
        user: `Análise competitiva:\n${context}`,
      },
      {
        key: "audienceInsights",
        system: `Você é especialista em comportamento do consumidor. Analise o público e responda em JSON:
{
  "personaIdeal": { "nome": "", "idade": "", "cargo": "", "dor_principal": "", "desejo_principal": "", "objecoes": [] },
  "jornadaDeCompra": [{ "etapa": "", "comportamento": "", "canaisUsados": [], "gatilho": "" }],
  "triggers_de_compra": [],
  "objecoes_comuns": [{ "objecao": "", "resposta": "" }],
  "onde_encontrar": [],
  "mensagens_que_convertem": []
}`,
        user: `Análise de público:\n${context}`,
      },
      {
        key: "opportunities",
        system: `Você é um consultor de growth strategy inspirado em Sabri Suby (King Kong). Responda em JSON:
{
  "oportunidadesImediatas": [{ "oportunidade": "", "impacto": "", "esforco": "", "prioridade": "" }],
  "estrategia_de_entrada": "",
  "diferenciacao_recomendada": "",
  "precificacao_estrategica": { "modelo": "", "justificativa": "", "ancora": "" },
  "canais_recomendados": [{ "canal": "", "porque": "", "investimento": "", "roi_esperado": "" }],
  "projecao_resultados": { "mes1": "", "mes3": "", "mes6": "" }
}`,
        user: `Oportunidades e estratégia:\n${context}`,
      },
    ]

    // Fire and forget
    Promise.allSettled(
      sections.map(async ({ key, system, user }) => {
        const data = await generateJSON(system, user, { temperature: 0.6, maxTokens: 2000 })
        return { key, data }
      })
    ).then(async (results) => {
      const reportData: Record<string, any> = {}
      for (const entry of results) {
        if (entry.status === "fulfilled") {
          reportData[entry.value.key] = entry.value.data
        }
      }

      await prisma.marketReport.update({
        where: { id: report.id },
        data: { status: "COMPLETED", data: reportData },
      })
      console.log(`Market report ${report.id} completed`)
    }).catch(async (err) => {
      console.error("Market analysis failed:", err)
      await prisma.marketReport.update({ where: { id: report.id }, data: { status: "FAILED" } })
    })

    return NextResponse.json({ reportId: report.id, companyId: company.id })
  } catch (error) {
    console.error("Error in intel/mercado/generate:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
