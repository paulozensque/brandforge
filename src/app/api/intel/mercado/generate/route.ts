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
  "tamanhoMercado": { "tam": "Total Addressable Market em R$", "sam": "Serviceable Addressable Market em R$", "som": "Serviceable Obtainable Market em R$", "explicacao_tam": "", "explicacao_sam": "", "explicacao_som": "" },
  "crescimentoAnual": "",
  "tendencias": ["tendência 1", "tendência 2", "tendência 3"],
  "cicloDeVida": "",
  "barreirasEntrada": [],
  "fatoresChave": [],
  "perspectiva5Anos": ""
}`,
        user: `Análise de mercado:\n${context}`,
      },
      {
        key: "swot",
        system: `Você é um consultor estratégico. Faça uma análise SWOT completa. Responda em JSON:
{
  "forcas": [{"item": "", "impacto": "alto/medio/baixo"}],
  "fraquezas": [{"item": "", "impacto": "alto/medio/baixo"}],
  "oportunidades": [{"item": "", "impacto": "alto/medio/baixo"}],
  "ameacas": [{"item": "", "impacto": "alto/medio/baixo"}],
  "estrategias_fo": ["usar força X para aproveitar oportunidade Y"],
  "estrategias_wt": ["mitigar fraqueza X contra ameaça Y"]
}
Gere pelo menos 4 itens em cada quadrante.`,
        user: `Análise SWOT para:\n${context}`,
      },
      {
        key: "competitorAnalysis",
        system: `Você é um especialista em inteligência competitiva. Analise os concorrentes e responda em JSON:
{
  "mapaCompetitivo": [{ "nome": "", "forca": "", "fraqueza": "", "posicionamento": "", "precoEstimado": "", "nivel_ameaca": 1-10 }],
  "lacunasDoMercado": [],
  "estrategiaOceanoAzul": { "eliminar": [], "reduzir": [], "elevar": [], "criar": [] },
  "vantagensCompetitivas": [],
  "comoVencer": []
}`,
        user: `Análise competitiva:\n${context}`,
      },
      {
        key: "porter",
        system: `Você é um estrategista usando o modelo das 5 Forças de Porter. Responda em JSON:
{
  "rivalidade_entre_concorrentes": { "intensidade": 1-10, "fatores": [], "estrategia": "" },
  "poder_fornecedores": { "intensidade": 1-10, "fatores": [], "estrategia": "" },
  "poder_compradores": { "intensidade": 1-10, "fatores": [], "estrategia": "" },
  "ameaca_substitutos": { "intensidade": 1-10, "fatores": [], "estrategia": "" },
  "ameaca_novos_entrantes": { "intensidade": 1-10, "fatores": [], "estrategia": "" },
  "atratividade_geral": 1-10,
  "recomendacao": ""
}`,
        user: `5 Forças de Porter para:\n${context}`,
      },
      {
        key: "opportunities",
        system: `Você é um consultor de growth strategy inspirado em Sabri Suby (King Kong). Responda em JSON:
{
  "oportunidadesImediatas": [{ "oportunidade": "", "impacto": "alto/medio/baixo", "esforco": "alto/medio/baixo", "prioridade": 1-5 }],
  "estrategia_de_entrada": "",
  "diferenciacao_recomendada": "",
  "precificacao_estrategica": { "modelo": "", "justificativa": "", "ancora": "" },
  "canais_recomendados": [{ "canal": "", "porque": "", "investimento": "", "roi_esperado": "" }],
  "projecao_resultados": { "mes1": "", "mes3": "", "mes6": "", "mes12": "" }
}`,
        user: `Oportunidades e estratégia:\n${context}`,
      },
      {
        key: "bcgMatrix",
        system: `Você é um consultor estratégico usando a Matriz BCG. Classifique os produtos/serviços. Responda em JSON:
{
  "estrelas": [{"produto": "", "crescimento": "", "participacao": "", "acao": ""}],
  "vacas_leiteiras": [{"produto": "", "crescimento": "", "participacao": "", "acao": ""}],
  "interrogacoes": [{"produto": "", "crescimento": "", "participacao": "", "acao": ""}],
  "abacaxis": [{"produto": "", "crescimento": "", "participacao": "", "acao": ""}],
  "recomendacao_portfolio": ""
}`,
        user: `Matriz BCG:\n${context}`,
      },
      {
        key: "ansoff",
        system: `Você é um estrategista usando a Matriz de Ansoff para crescimento. Responda em JSON:
{
  "penetracao_mercado": {"estrategia": "", "acoes": [], "risco": "baixo/medio/alto", "roi_estimado": ""},
  "desenvolvimento_produto": {"estrategia": "", "acoes": [], "risco": "baixo/medio/alto", "roi_estimado": ""},
  "desenvolvimento_mercado": {"estrategia": "", "acoes": [], "risco": "baixo/medio/alto", "roi_estimado": ""},
  "diversificacao": {"estrategia": "", "acoes": [], "risco": "baixo/medio/alto", "roi_estimado": ""},
  "estrategia_recomendada": "",
  "justificativa": ""
}`,
        user: `Matriz de Ansoff:\n${context}`,
      },
      {
        key: "valueChain",
        system: `Você é um especialista em Cadeia de Valor de Porter. Analise as atividades primárias e de suporte. Responda em JSON:
{
  "atividades_primarias": {
    "logistica_entrada": {"descricao": "", "otimizacao": ""},
    "operacoes": {"descricao": "", "otimizacao": ""},
    "logistica_saida": {"descricao": "", "otimizacao": ""},
    "marketing_vendas": {"descricao": "", "otimizacao": ""},
    "servico_pos_venda": {"descricao": "", "otimizacao": ""}
  },
  "atividades_suporte": {
    "infraestrutura": "",
    "gestao_rh": "",
    "tecnologia": "",
    "aquisicao": ""
  },
  "margem_valor": "",
  "gargalos": [],
  "quick_wins": []
}`,
        user: `Cadeia de Valor:\n${context}`,
      },
      {
        key: "customerJourney",
        system: `Você é especialista em Customer Experience e Jornada do Cliente. Responda em JSON:
{
  "persona": {"nome": "", "idade": "", "cargo": "", "dor_principal": "", "desejo": ""},
  "jornada": [
    {"etapa": "Descoberta", "touchpoints": [], "emocao": "", "acao_cliente": "", "oportunidade": ""},
    {"etapa": "Consideracao", "touchpoints": [], "emocao": "", "acao_cliente": "", "oportunidade": ""},
    {"etapa": "Decisao", "touchpoints": [], "emocao": "", "acao_cliente": "", "oportunidade": ""},
    {"etapa": "Compra", "touchpoints": [], "emocao": "", "acao_cliente": "", "oportunidade": ""},
    {"etapa": "Pos-venda", "touchpoints": [], "emocao": "", "acao_cliente": "", "oportunidade": ""},
    {"etapa": "Advocacia", "touchpoints": [], "emocao": "", "acao_cliente": "", "oportunidade": ""}
  ],
  "momentos_verdade": [],
  "gatilhos_conversao": [],
  "objecoes": [{"objecao": "", "resposta": ""}]
}`,
        user: `Jornada do Cliente:\n${context}`,
      },
      {
        key: "positioning",
        system: `Você é um estrategista de posicionamento usando Al Ries, Jack Trout e Chris Do (The Futur). Responda em JSON:
{
  "mapa_posicionamento": {"eixo_x": "", "eixo_y": "", "posicao_empresa": "", "posicao_concorrentes": [{"nome": "", "x": 1-10, "y": 1-10}]},
  "category_of_one": "",
  "proposta_valor_unica": "",
  "tagline_sugerida": "",
  "manifesto": "",
  "elevator_pitch_30s": "",
  "brand_promise": "",
  "reasons_to_believe": [],
  "diferencial_inimitavel": ""
}`,
        user: `Posicionamento estratégico:\n${context}`,
      },
    ]

    // Generate all sections and wait for results
    const results = await Promise.allSettled(
      sections.map(async ({ key, system, user }) => {
        const data = await generateJSON(system, user, { temperature: 0.6, maxTokens: 2000 })
        return { key, data }
      })
    )

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

    return NextResponse.json({ reportId: report.id, companyId: company.id, status: "COMPLETED" })
  } catch (error) {
    console.error("Error in intel/mercado/generate:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
