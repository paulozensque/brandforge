import { NextRequest, NextResponse } from "next/server"
import { generateJSON } from "@/lib/ai/openai-client"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { mode, format, tom, extraContext, mediaFiles } = await req.json()

    if (!mode || !format || !tom) {
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 })
    }

    // Load company context from analyses
    const [companyProfile, lastBrandReport, lastMarketReport] = await Promise.all([
      prisma.companyProfile.findFirst(),
      prisma.brandReport.findFirst({ where: { status: "COMPLETED" }, orderBy: { createdAt: "desc" } }),
      prisma.marketReport.findFirst({ where: { status: "COMPLETED" }, orderBy: { createdAt: "desc" } }),
    ])

    // Build rich context from all saved data
    const companyContext = companyProfile ? `
EMPRESA: ${companyProfile.description || ""}
SERVIÇOS: ${companyProfile.services || ""}
PÚBLICO: ${companyProfile.targetAudience || ""}
DIFERENCIAIS: ${companyProfile.differentials || ""}
DORES QUE RESOLVE: ${companyProfile.painPoints || ""}
BENEFÍCIOS: ${companyProfile.benefits || ""}
TOM: ${companyProfile.mission || ""}
` : ""

    const brandContext = lastBrandReport?.brandArchetype ?
      `POSICIONAMENTO: ${JSON.stringify(lastBrandReport.brandArchetype).substring(0, 500)}` : ""

    const marketContext = lastMarketReport?.data ?
      `MERCADO: ${JSON.stringify(lastMarketReport.data).substring(0, 500)}` : ""

    // Format descriptions
    const formatDesc: Record<string, string> = {
      video: "Roteiro de vídeo completo com: HOOK (3 primeiros segundos que prendem), DESENVOLVIMENTO, CTA. Inclua direções de gravação, expressões faciais, cortes e música sugerida.",
      imagem: "Copy completa para post de imagem com: HEADLINE impactante, TEXTO do post, HASHTAGS, PROMPT para gerar a imagem com IA (Midjourney/DALL-E style).",
      carrossel: "Carrossel slide por slide (8-10 slides) com: CAPA (headline matadora), cada slide com texto curto e impactante, ÚLTIMO SLIDE com CTA forte.",
    }

    // Tom descriptions for content (viral)
    const tomDescConteudo: Record<string, string> = {
      educativo: "Ensina algo valioso em formato conciso. Use dados, listas e insights. Formatos virais: '5 coisas que...', 'O erro que 90% comete...', 'Como fazer X em Y passos'.",
      storytelling: "Conta uma história real e envolvente. Use estrutura: gancho emocional → conflito → virada → lição. Formatos virais: 'Eu perdi tudo quando...', 'O dia que mudou tudo...'.",
      bastidores: "Mostra vulnerabilidade e realidade. Dia a dia, erros, processo. Formatos virais: 'Ninguém te mostra isso...', 'A verdade sobre...', 'POV: você é dono de...'.",
      controverso: "Opinião forte que gera debate e compartilhamento. Quebre um paradigma do nicho. Formatos virais: 'Unpopular opinion:', '[Coisa popular] é uma farsa', 'Por que eu parei de...'.",
      transformacao: "Mostra resultado real antes/depois. Use números e provas. Formatos virais: 'De X a Y em Z dias', 'O resultado depois de...', 'Método que gerou R$...'.",
      tendencia: "Use o formato trending do momento. Adapte trends do TikTok/Reels para o nicho. Use áudios virais, templates populares e formatos que o algoritmo prioriza AGORA.",
    }

    // Tom descriptions for creatives (high conversion)
    const tomDescCriativo: Record<string, string> = {
      dor: "Apele para a dor URGENTE do público. Use linguagem emocional. Estrutura: Identifique a dor → agite → mostre consequência → apresente solução. Baseado em criativos com CTR acima de 3%.",
      curiosidade: "HOOK irresistível que obriga a clicar. Use curiosity gap, pattern interrupt. Estrutura: Frase enigmática → 'Descubra como...' → benefício implícito. Baseado em ads com maior watch time.",
      prova_social: "Use depoimentos reais, números e resultados. Estrutura: Screenshot de resultado → texto do cliente → headline com número. Baseado em criativos com maior taxa de conversão.",
      escassez: "Crie urgência real. Countdown, vagas limitadas, preço que vai subir. Estrutura: Benefício → oferta → escassez → CTA urgente. Baseado em criativos FOMO de alto ROAS.",
      autoridade: "Posicione como expert #1. Use dados, credenciais, metodologia proprietária. Estrutura: Credencial → insight exclusivo → promessa → CTA confiante. Baseado em ads B2B de alta conversão.",
      oferta_direta: "Oferta clara e irresistível. Value stack, garantia, bonus. Estrutura: Headline com benefício principal → lista de entregáveis → preço ancorado → garantia → CTA. Estilo King Kong/Hormozi.",
    }

    const tomContext = mode === "conteudo" ? tomDescConteudo[tom] : tomDescCriativo[tom]

    const system = mode === "conteudo"
      ? `Você é um estrategista de conteúdo viral expert em Instagram, TikTok e LinkedIn.
Você estuda DIARIAMENTE os conteúdos mais virais da internet e conhece os padrões que fazem posts explodirem.

SUAS REFERÊNCIAS DE VIRAL:
- Hooks de 3 segundos que impedem o scroll
- Pattern interrupts visuais e textuais
- Storytelling com loops abertos
- Formatos que o algoritmo prioriza (watch time, saves, shares)
- Estruturas testadas: Problema→Solução, Mito→Verdade, Lista de X, POV, Before/After

FORMATO SOLICITADO: ${formatDesc[format]}
TOM/ABORDAGEM: ${tomContext}

Responda em JSON:
{
  "content": {
    "hook": "Os primeiros 3 segundos / primeira linha que prende",
    "roteiro_ou_copy": "O conteúdo completo pronto para usar",
    "cta": "Call to action final",
    "hashtags": "Hashtags relevantes",
    "dica_execucao": "Como gravar/criar para maximizar viralidade",
    "formato_viral_usado": "Qual padrão viral este conteúdo usa",
    "estimativa_alcance": "Por que esse formato tende a viralizar"
  }
}

Se for carrossel, use:
{
  "content": {
    "slides": [{"slide": 1, "texto": "", "dica_visual": ""}],
    "hashtags": "",
    "formato_viral_usado": ""
  }
}

Responda em português do Brasil. Seja ESPECÍFICO e prático.`
      : `Você é um media buyer e copywriter de performance expert em anúncios de alta conversão.
Você estuda DIARIAMENTE os criativos com maior CTR, ROAS e taxa de conversão do mercado.

SUAS REFERÊNCIAS DE ALTA CONVERSÃO:
- Sabri Suby (King Kong): Godfather Offer, Dream 100, hooks apelativos
- Alex Hormozi: Value equation, offer stacking, $100M Offers
- Frank Kern: Behavioral dynamic response, story-based selling
- Ads com CTR > 3%, ROAS > 4x, CPA < média do mercado

FORMATO SOLICITADO: ${formatDesc[format]}
ABORDAGEM DE CONVERSÃO: ${tomContext}

Responda em JSON:
{
  "content": {
    "headline_principal": "A headline matadora do anúncio",
    "headlines_alternativas": ["variação 1", "variação 2"],
    "copy_principal": "Texto completo do anúncio",
    "cta": "Call to action",
    "prompt_visual": "Descrição detalhada da imagem/vídeo para criar com IA",
    "segmentacao_sugerida": "Público recomendado para este criativo",
    "dica_performance": "Como otimizar este criativo para máxima conversão",
    "metricas_esperadas": "CTR e conversão esperados baseado no formato"
  }
}

Se for carrossel, adapte com slides.
Se for vídeo, inclua roteiro completo com timestamps.

Responda em português do Brasil. Seja ESPECÍFICO e PERSUASIVO.`

    const user = `Crie ${mode === "conteudo" ? "um conteúdo viral" : "um criativo de alta conversão"} no formato ${format} com tom ${tom}.

CONTEXTO DA EMPRESA:
${companyContext}
${brandContext}
${marketContext}

${extraContext ? `CONTEXTO ADICIONAL DO CLIENTE: ${extraContext}` : ""}
${mediaFiles?.length ? `MÍDIAS DISPONÍVEIS: ${mediaFiles.join(", ")}` : ""}

Lembre: ${mode === "conteudo"
  ? "O conteúdo PRECISA ser viral. Use hooks irresistíveis, pattern interrupts e formatos que o algoritmo prioriza."
  : "O criativo PRECISA converter. Use copy persuasiva, gatilhos mentais fortes e estruturas testadas de alta performance."
}`

    const result = await generateJSON(system, user, { temperature: 0.8, maxTokens: 3000 })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Content generation error:", error)
    return NextResponse.json({ error: "Erro ao gerar" }, { status: 500 })
  }
}
