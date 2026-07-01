import { NextRequest, NextResponse } from "next/server"
import { generateJSON } from "@/lib/ai/openai-client"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { nicho, regiao, cargo, tamanhoEmpresa, plataforma } = await req.json()

    if (!nicho || !regiao) {
      return NextResponse.json({ error: "Nicho e região obrigatórios" }, { status: 400 })
    }

    // Load company context
    const companyProfile = await prisma.companyProfile.findFirst()

    const system = `Você é um especialista em prospecção ativa B2B e vendas consultivas.
Sua missão é encontrar PROSPECTS REAIS que sejam potenciais clientes ideais.

Para cada prospect, forneça:
- Nome fictício mas realista (empresa ou pessoa)
- Cargo do decisor
- Empresa
- Como encontrar o contato (onde buscar email/telefone/perfil)
- Sugestão de ABORDAGEM PERSONALIZADA baseada no perfil

ESTRATÉGIA DE PROSPECÇÃO QUE VOCÊ USA:
1. Social selling (engajamento antes de abordar)
2. Personalização extrema (mencionar algo específico do prospect)
3. Valor primeiro (oferecer algo antes de pedir)
4. Multi-canal (LinkedIn + Email + WhatsApp)
5. Follow-up persistente mas respeitoso (3-5 touchpoints)

Para a busca em ${plataforma}:
${plataforma === "linkedin" ? "Sugira termos de busca, filtros e operadores booleanos para LinkedIn Sales Navigator" : ""}
${plataforma === "instagram" ? "Sugira hashtags, perfis referência e como encontrar clientes pelo Instagram" : ""}
${plataforma === "google_maps" ? "Sugira termos de busca no Google Maps, filtros de avaliação e como abordar negócios locais" : ""}
${plataforma === "sites" ? "Sugira diretórios, associações, listas e sites de nicho para encontrar leads" : ""}

Responda em JSON:
{
  "estrategia_busca": "Como encontrar esses prospects na plataforma escolhida",
  "filtros_recomendados": "Filtros e termos de busca específicos",
  "prospects": [
    {
      "nome": "",
      "cargo": "",
      "empresa": "",
      "segmento": "",
      "contato": "Como/onde encontrar o contato",
      "email": "email provável ou como descobrir",
      "perfil": "URL provável do perfil",
      "dor_provavel": "Qual dor esse prospect provavelmente tem",
      "abordagem": "Mensagem personalizada de primeiro contato (máx 3 frases)"
    }
  ],
  "script_abordagem_geral": "Template de mensagem que funciona para este nicho",
  "dicas_taxa_resposta": ["dica 1", "dica 2", "dica 3"]
}

Gere pelo menos 8 prospects diferentes e realistas para o nicho e região pedidos.
Responda em português do Brasil.`

    const user = `Encontre prospects para prospecção ativa:
NICHO: ${nicho}
REGIÃO: ${regiao}
CARGO DECISOR: ${cargo || "Dono / CEO / Diretor"}
TAMANHO DA EMPRESA: ${tamanhoEmpresa || "Qualquer"}
PLATAFORMA DE BUSCA: ${plataforma}

SOBRE QUEM ESTÁ PROSPECTANDO:
${companyProfile?.description || "Empresa de serviços"}
SERVIÇOS: ${companyProfile?.services || "Consultoria"}
DIFERENCIAL: ${companyProfile?.differentials || "Resultado comprovado"}

Encontre os prospects MAIS QUALIFICADOS possíveis. 
Pessoas que tenham ALTA PROBABILIDADE de precisar dos nossos serviços.
Gere abordagens PERSONALIZADAS que gerem resposta.`

    const result = await generateJSON(system, user, { temperature: 0.8, maxTokens: 3000 })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Prospection error:", error)
    return NextResponse.json({ error: "Erro ao buscar prospects" }, { status: 500 })
  }
}
