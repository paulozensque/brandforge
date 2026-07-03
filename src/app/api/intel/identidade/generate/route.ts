import { NextRequest, NextResponse } from "next/server"
import { generateJSON } from "@/lib/ai/openai-client"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.companyName) {
      return NextResponse.json({ error: "Nome da marca obrigatório" }, { status: 400 })
    }

    const system = `Você é um diretor de arte e brand designer com 20 anos de experiência criando identidades visuais para marcas premium.

Crie EXATAMENTE 3 propostas de identidade visual COMPLETAMENTE DIFERENTES entre si.
Cada proposta deve ser uma direção visual única e completa.

Responda em JSON:
{
  "propostas": [
    {
      "nome": "Nome criativo da proposta (ex: 'Zen Minimal', 'Power Bold')",
      "conceito": "Conceito criativo por trás desta proposta (1 frase)",
      "cores": [
        {"hex": "#XXXXXX", "nome": "Nome da cor", "uso": "Onde usar"},
        {"hex": "#XXXXXX", "nome": "Nome da cor", "uso": "Onde usar"},
        {"hex": "#XXXXXX", "nome": "Nome da cor", "uso": "Onde usar"},
        {"hex": "#XXXXXX", "nome": "Nome da cor", "uso": "Onde usar"},
        {"hex": "#XXXXXX", "nome": "Nome da cor", "uso": "Onde usar"}
      ],
      "tipografia": {
        "titulo": "Nome da fonte (Google Fonts)",
        "corpo": "Nome da fonte (Google Fonts)",
        "destaque": "Nome da fonte (Google Fonts)"
      },
      "estilo": "Descrição do estilo visual geral",
      "direcao_logo": "Como o logo deve ser: forma, ícone, tipografia, conceito",
      "elementos_graficos": "Patterns, ícones, formas que complementam",
      "aplicacoes": "Como fica no Instagram, site, cartão de visita",
      "mood": "Que sensação transmite",
      "porque_funciona": "Por que esta proposta é ideal para este tipo de marca"
    }
  ]
}

Use APENAS fontes do Google Fonts.
Cada proposta deve ter uma paleta de 5 cores com hex codes reais.
As 3 propostas devem ser RADICALMENTE diferentes (ex: uma minimalista, uma bold, uma sofisticada).
Responda em português do Brasil.`

    const user = `Crie 3 propostas de identidade visual para:

MARCA: ${body.companyName}
SEGMENTO: ${body.segment || "Não informado"}
PERSONALIDADE: ${(body.personality || []).join(", ") || "Não definida"}
PREFERÊNCIA DE CORES: ${body.colorPreference || "Sem preferência"}
CORES A EVITAR: ${body.avoidColors || "Nenhuma"}
ESTILO VISUAL: ${body.stylePreference || "Não definido"}
SENSAÇÃO DESEJADA: ${body.feeling || "Não definida"}
PÚBLICO-ALVO: ${body.targetAudience || "Geral"}
REFERÊNCIAS: ${body.references || "Nenhuma"}
TEM LOGO: ${body.hasLogo || "Não informado"}

Crie 3 propostas completamente diferentes e profissionais.`

    const result = await generateJSON(system, user, { temperature: 0.8, maxTokens: 3000 })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Identity generation error:", error)
    return NextResponse.json({ error: "Erro ao gerar" }, { status: 500 })
  }
}
