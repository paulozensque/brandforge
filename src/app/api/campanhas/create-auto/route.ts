import { NextRequest, NextResponse } from "next/server"
import { generateJSON } from "@/lib/ai/openai-client"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { objective, budget, duration, targetAudience, landingPage, platforms } = await req.json()

    // Load all intelligence data
    const [companyProfile, lastBrandReport, lastMarketReport] = await Promise.all([
      prisma.companyProfile.findFirst(),
      prisma.brandReport.findFirst({ where: { status: "COMPLETED" }, orderBy: { createdAt: "desc" } }),
      prisma.marketReport.findFirst({ where: { status: "COMPLETED" }, orderBy: { createdAt: "desc" } }),
    ])

    const context = `
EMPRESA: ${companyProfile?.description || "Não informado"}
SERVIÇOS: ${companyProfile?.services || "Não informado"}
PÚBLICO: ${companyProfile?.targetAudience || targetAudience || "Não informado"}
DIFERENCIAIS: ${companyProfile?.differentials || "Não informado"}
TICKET MÉDIO: ${companyProfile?.averageTicket || "Não informado"}
ANÁLISE DE MARCA: ${lastBrandReport?.brandArchetype ? JSON.stringify(lastBrandReport.brandArchetype).substring(0, 300) : "N/A"}
ANÁLISE DE MERCADO: ${lastMarketReport?.data ? JSON.stringify(lastMarketReport.data).substring(0, 300) : "N/A"}
`

    const platformNames = platforms.join(", ") || "Meta Ads"
    const objectiveMap: Record<string, string> = {
      leads: "Geração de leads qualificados",
      vendas: "Vendas/Conversão direta",
      trafego: "Tráfego para landing page",
      mensagens: "Mensagens no WhatsApp (Click-to-WhatsApp)",
      awareness: "Reconhecimento de marca",
    }

    const system = `Você é um gestor de tráfego pago expert com ROAS consistente acima de 4x.
Você deve criar uma CAMPANHA COMPLETA otimizada para ${platformNames}.
Baseie TUDO nos dados da empresa e análise de mercado fornecidos.

Use a estratégia de Funil Y:
- Tráfego pago converte leads que são aquecidos pelo orgânico
- Leads vão para CRM e são atendidos por SDR IA no WhatsApp

Responda em JSON:
{
  "estrategia_geral": "Resumo da estratégia escolhida e por quê",
  "campanha": {
    "nome": "",
    "objetivo": "",
    "budget_diario": "",
    "duracao": "",
    "plataformas": []
  },
  "estrutura_por_plataforma": [
    {
      "plataforma": "",
      "tipo_campanha": "",
      "objetivo_plataforma": "",
      "conjuntos_anuncio": [
        {
          "nome": "",
          "segmentacao": "",
          "publico_tamanho": "",
          "budget_percentual": ""
        }
      ]
    }
  ],
  "criativos_recomendados": [
    {
      "tipo": "",
      "headline": "",
      "copy_resumo": "",
      "formato": "",
      "onde_usar": ""
    }
  ],
  "testes_ab": [
    {
      "variavel": "",
      "variacao_a": "",
      "variacao_b": "",
      "metrica_decisao": ""
    }
  ],
  "cronograma_otimizacao": {
    "dia_1_3": "Fase de aprendizado - não mexer",
    "dia_5": "Primeira análise - pausar underperformers",
    "dia_10": "Scale winners, ajustar bids",
    "dia_15": "Novos criativos, expandir públicos",
    "dia_30": "Análise completa, escalar"
  },
  "metricas_alvo": {
    "ctr_meta": "",
    "cpc_meta": "",
    "cpl_meta": "",
    "roas_meta": ""
  },
  "integracao_crm": "Como os leads entram no CRM e são atendidos pelo SDR IA"
}

Seja ESPECÍFICO com segmentações, interesses, lookalikes, e configurações reais de cada plataforma.
Responda em português do Brasil.`

    const user = `Crie campanha otimizada:
OBJETIVO: ${objectiveMap[objective] || objective}
BUDGET DIÁRIO: ${budget || "A definir"}
DURAÇÃO: ${duration} dias
PLATAFORMAS: ${platformNames}
LANDING PAGE / WHATSAPP: ${landingPage || "WhatsApp"}
PÚBLICO DEFINIDO: ${targetAudience || "Definir automaticamente"}

CONTEXTO DA EMPRESA E MERCADO:
${context}

Monte a melhor campanha possível para gerar leads qualificados ao menor custo.
Os leads devem cair no CRM automaticamente e ser atendidos pelo SDR IA.`

    const result = await generateJSON(system, user, { temperature: 0.7, maxTokens: 3000 })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Campaign creation error:", error)
    return NextResponse.json({ error: "Erro ao criar campanha" }, { status: 500 })
  }
}
