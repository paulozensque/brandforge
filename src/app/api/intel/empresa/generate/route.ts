import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateJSON } from "@/lib/ai/openai-client"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.name || !body.industry) {
      return NextResponse.json({ error: "Nome e indústria são obrigatórios" }, { status: 400 })
    }

    // Ensure demo user
    const user = await prisma.user.upsert({
      where: { email: "demo@brandforge.local" },
      update: {},
      create: { id: "demo-user", email: "demo@brandforge.local", name: "Demo User" },
    })

    // Save company data
    const company = await prisma.company.create({
      data: {
        userId: user.id,
        name: body.name,
        industry: body.industry,
        segment: body.segment || null,
        website: body.website || null,
        teamSize: body.teamSize || null,
        location: body.location || null,
        purpose: body.currentPositioning || null,
        values: body.brandValues || [],
        differentials: body.currentDifferentials || [],
        targetAudience: body.targetAudience || null,
        mainCompetitors: [],
        marketPosition: body.currentPositioning || null,
        priceRange: body.priceRange || null,
        brandTone: body.brandTone || [],
        brandKeywords: body.mainProducts || [],
        inspirations: body.inspirations || [],
        avoidWords: [],
        currentProblems: body.currentProblems || null,
        goals: body.goals || null,
        timeline: body.timeline || null,
      },
    })

    const report = await prisma.brandReport.create({
      data: { companyId: company.id, status: "GENERATING" },
    })

    // Build context string for AI
    const context = `
EMPRESA: ${body.name}
INDÚSTRIA: ${body.industry} | SEGMENTO: ${body.segment || "N/A"}
LOCALIZAÇÃO: ${body.location || "N/A"} | EQUIPE: ${body.teamSize || "N/A"}
FATURAMENTO: ${body.revenue || "N/A"} | ANOS NO MERCADO: ${body.yearsInMarket || "N/A"}
PRODUTOS/SERVIÇOS: ${(body.mainProducts || []).join(", ") || "N/A"}
TICKET MÉDIO: ${body.avgTicket || "N/A"} | FAIXA DE PREÇO: ${body.priceRange || "N/A"}
MODELO: ${body.deliveryModel || "N/A"}
POSICIONAMENTO ATUAL: ${body.currentPositioning || "N/A"}
PROMESSA ATUAL: ${body.currentPromise || "N/A"}
DIFERENCIAIS: ${(body.currentDifferentials || []).join(", ") || "N/A"}
PROBLEMAS ATUAIS: ${body.currentProblems || "N/A"}
PÚBLICO-ALVO: ${body.targetAudience || "N/A"}
DORES DO PÚBLICO: ${(body.audiencePains || []).join(", ") || "N/A"}
DESEJOS DO PÚBLICO: ${(body.audienceDesires || []).join(", ") || "N/A"}
TOM DE VOZ: ${(body.brandTone || []).join(", ") || "N/A"}
VALORES: ${(body.brandValues || []).join(", ") || "N/A"}
INSPIRAÇÕES: ${(body.inspirations || []).join(", ") || "N/A"}
OBJETIVOS: ${body.goals || "N/A"}
TIMELINE: ${body.timeline || "N/A"}
BUDGET MENSAL: ${body.monthlyBudget || "N/A"}
`.trim()

    // Generate all sections in parallel
    const sections = [
      {
        key: "brandTransformation",
        system: `Você é um estrategista de branding expert nas metodologias de Chris Do (The Futur) e Sabri Suby (King Kong). 
Analise a empresa e crie uma TRANSFORMAÇÃO DE MARCA completa. Responda em JSON:
{
  "diagnostico": { "pontosFracos": [], "oportunidades": [], "riscos": [] },
  "novoPositioning": { "statement": "", "categoryOfOne": "", "whyNow": "" },
  "promessaDeValor": { "headline": "", "subheadline": "", "proofPoints": [] },
  "brandTransformation": { "de": "", "para": "", "comoChegar": [] },
  "ofertaIrresistivel": { "nome": "", "descricao": "", "entregaveis": [], "garantia": "", "urgencia": "", "preco_sugerido": "" },
  "sabriSubyFormula": { "godfather_offer": "", "dream_outcome": "", "perceived_likelihood": "", "time_delay": "", "effort_sacrifice": "" }
}
Seja específico e prático. Use a metodologia "Godfather Offer" de Sabri Suby e o "Positioning Statement" de Chris Do.`,
        user: `Analise e crie transformação de marca para:\n${context}`,
      },
      {
        key: "brandVoice",
        system: `Você é um especialista em comunicação de marca, inspirado em Chris Do (The Futur).
Crie guidelines de voz e comunicação. Responda em JSON:
{
  "personalidadeDaMarca": { "arquetipo": "", "personalidade": "", "tom": "" },
  "voiceGuidelines": { "comoFalar": [], "comoNaoFalar": [], "palavrasChave": [], "frasesProibidas": [] },
  "messagingFramework": { "oneLiner": "", "elevatorPitch": "", "manifesto": "" },
  "contentPillars": [{ "pilar": "", "descricao": "", "exemplos": [] }],
  "hookFormulas": [{ "formula": "", "exemplo": "" }]
}`,
        user: `Crie voz e comunicação para:\n${context}`,
      },
      {
        key: "visualIdentity",
        system: `Você é um diretor de arte e brand designer. Crie direções visuais. Responda em JSON:
{
  "corPrincipal": { "hex": "", "nome": "", "psicologia": "" },
  "paletaCompleta": [{ "hex": "", "uso": "" }],
  "tipografia": { "titulo": "", "corpo": "", "destaque": "" },
  "estiloVisual": { "estetica": "", "fotografiaStyle": "", "elementosGraficos": [] },
  "moodKeywords": [],
  "referenciaVisuais": []
}
Use apenas fontes do Google Fonts.`,
        user: `Crie identidade visual para:\n${context}`,
      },
      {
        key: "ofertaEProdutos",
        system: `Você é um estrategista de oferta inspirado em Sabri Suby (King Kong) e Alex Hormozi.
Crie a estrutura de oferta perfeita. Responda em JSON:
{
  "valueStack": [{ "item": "", "valorPercebido": "", "entrega": "" }],
  "ofertaPrincipal": { "nome": "", "headline": "", "preco": "", "ancoragem": "" },
  "garantia": { "tipo": "", "descricao": "", "duracao": "" },
  "urgencia": { "tipo": "", "mensagem": "" },
  "bonusStack": [{ "nome": "", "valor": "", "descricao": "" }],
  "funil": { "topo": "", "meio": "", "fundo": "", "retencao": "" },
  "metricas_alvo": { "cac_ideal": "", "ltv_ideal": "", "roas_minimo": "" }
}
Use a fórmula: Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)`,
        user: `Crie estrutura de oferta para:\n${context}`,
      },
      {
        key: "actionPlan",
        system: `Você é um consultor de growth e branding. Crie um plano de ação prático. Responda em JSON:
{
  "primeiros30Dias": [{ "acao": "", "prioridade": "", "impacto": "" }],
  "dias30a90": [{ "acao": "", "prioridade": "", "impacto": "" }],
  "dias90a180": [{ "acao": "", "prioridade": "", "impacto": "" }],
  "quickWins": [],
  "kpis": [{ "metrica": "", "meta": "", "prazo": "" }],
  "investimentoRecomendado": { "branding": "", "trafego": "", "conteudo": "", "ferramentas": "" }
}`,
        user: `Crie plano de ação para:\n${context}`,
      },
    ]

    // Fire and forget - generate in background
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

      await prisma.brandReport.update({
        where: { id: report.id },
        data: {
          status: "COMPLETED",
          brandArchetype: reportData.brandTransformation || null,
          brandVoice: reportData.brandVoice || null,
          visualIdentity: reportData.visualIdentity || null,
          brandPositioning: reportData.ofertaEProdutos || null,
          brandEcosystem: reportData.actionPlan || null,
        },
      })
      console.log(`Intel report ${report.id} completed`)
    }).catch(async (err) => {
      console.error("Intel generation failed:", err)
      await prisma.brandReport.update({ where: { id: report.id }, data: { status: "FAILED" } })
    })

    return NextResponse.json({ reportId: report.id, companyId: company.id })
  } catch (error) {
    console.error("Error in intel/empresa/generate:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
