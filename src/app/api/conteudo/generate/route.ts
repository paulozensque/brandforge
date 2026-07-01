import { NextRequest, NextResponse } from "next/server"
import { generateJSON } from "@/lib/ai/openai-client"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { businessDescription, targetAudience, tone, platform, contentType, topic, quantity } = body

    if (!businessDescription) {
      return NextResponse.json({ error: "Descrição obrigatória" }, { status: 400 })
    }

    const platformMap: Record<string, string> = {
      instagram: "Instagram (limite 2200 chars na legenda, usar emojis, hashtags relevantes)",
      linkedin: "LinkedIn (profissional, storytelling, sem hashtags excessivas)",
      tiktok: "TikTok (linguagem jovem, hooks fortes, trending)",
      youtube: "YouTube (SEO, thumbnails, descrições completas)",
      facebook: "Facebook (engajamento, perguntas, compartilhável)",
      email: "E-mail Marketing (assunto matador, CTA claro, personalizado)",
    }

    const typeMap: Record<string, string> = {
      posts: "posts com legenda completa",
      stories: "roteiros de stories sequenciais",
      reels: "roteiros curtos para Reels/TikTok (hook + conteúdo + CTA)",
      carousel: "carrosséis (slide por slide com texto de cada card)",
      ads: "copies de anúncio (headline, texto principal, CTA, variações)",
      email: "e-mails de sequência (assunto + corpo + CTA)",
    }

    const system = `Você é um copywriter e content strategist expert.
Crie ${quantity} ${typeMap[contentType] || "peças de conteúdo"} para ${platformMap[platform] || platform}.
Tom de voz: ${tone || "profissional e envolvente"}.
Público: ${targetAudience || "empreendedores"}.

Responda em JSON:
{
  "content": [
    { "titulo": "", "texto": "", "hashtags": "", "cta": "" }
  ]
}

Cada peça deve ser única, criativa e pronta para publicar.
Use hooks fortes inspirados em Sabri Suby (King Kong) e storytelling de Chris Do (The Futur).
Responda em português do Brasil.`

    const user = `Empresa: ${businessDescription}
Tema: ${topic || "conteúdo geral da marca"}
Quantidade: ${quantity} peças
Plataforma: ${platform}
Tipo: ${contentType}`

    const result = await generateJSON(system, user, { temperature: 0.8, maxTokens: 3000 })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Content generation error:", error)
    return NextResponse.json({ error: "Erro ao gerar" }, { status: 500 })
  }
}
