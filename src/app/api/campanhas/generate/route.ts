import { NextRequest, NextResponse } from "next/server"
import { generateJSON } from "@/lib/ai/openai-client"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { business, product, targetAudience, budget, objective, platform, landingPage } = body

    if (!business || !product) {
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 })
    }

    const platformConfig: Record<string, string> = {
      meta: "Meta Ads (Facebook + Instagram). Inclua: estrutura de campanha, conjuntos de anúncios, segmentação detalhada, formatos criativos.",
      google: "Google Ads. Inclua: campanhas de Search + Display, palavras-chave, extensões de anúncio, copies responsivas.",
      tiktok: "TikTok Ads. Inclua: formatos nativos, hooks de 3 segundos, CTAs diretos, tendências.",
    }

    const objMap: Record<string, string> = {
      conversao: "Conversão e vendas diretas",
      leads: "Geração de leads qualificados",
      trafego: "Tráfego para landing page",
      awareness: "Reconhecimento de marca",
    }

    const system = `Você é um gestor de tráfego pago expert em ${platformConfig[platform] || "mídia paga"}.
Crie uma estrutura COMPLETA de campanha. Responda em JSON:
{
  "estrategia": "",
  "estrutura_campanha": { "nome": "", "objetivo": "", "orcamento": "", "duracao": "" },
  "publicos": [{ "nome": "", "segmentacao": "", "tamanho_estimado": "" }],
  "criativos": [{ "formato": "", "headline": "", "texto": "", "cta": "", "descricao_visual": "" }],
  "copies_variações": [{ "headline": "", "texto": "", "cta": "" }],
  "metricas_alvo": { "ctr": "", "cpc": "", "cpa": "", "roas": "" },
  "dicas_otimizacao": [],
  "testes_ab": []
}

Use estratégias de Sabri Suby (King Kong): hooks fortes, oferta irresistível, urgência.
Responda em português do Brasil.`

    const user = `Empresa: ${business}
Produto/Oferta: ${product}
Público: ${targetAudience || "A definir"}
Objetivo: ${objMap[objective] || objective}
Budget: ${budget || "A definir"}
Plataforma: ${platform}
Landing Page: ${landingPage || "N/A"}`

    const result = await generateJSON(system, user, { temperature: 0.7, maxTokens: 3000 })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Campaign generation error:", error)
    return NextResponse.json({ error: "Erro ao gerar" }, { status: 500 })
  }
}
