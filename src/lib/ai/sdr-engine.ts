import { generateCompletion } from "./openai-client"
import { prisma } from "@/lib/db"

interface SDRContext {
  companyId: string
  leadId: string
  conversationId: string
  incomingMessage: string
}

export async function processSDRMessage(ctx: SDRContext): Promise<string> {
  const { companyId, leadId, conversationId, incomingMessage } = ctx

  // Load context
  const [settings, profile, lead, messages] = await Promise.all([
    prisma.aiSettings.findUnique({ where: { companyId } }),
    prisma.companyProfile.findUnique({ where: { companyId } }),
    prisma.lead.findUnique({ where: { id: leadId } }),
    prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 20,
    }),
  ])

  // Save user message
  await prisma.message.create({
    data: { conversationId, role: "USER", content: incomingMessage },
  })

  // Build system prompt
  const systemPrompt = buildSystemPrompt(settings, profile)
  
  // Build conversation history
  const history = messages.map((m) => ({
    role: m.role.toLowerCase() as "user" | "assistant" | "system",
    content: m.content,
  }))

  // Add new message
  history.push({ role: "user", content: incomingMessage })

  // Generate response
  const fullPrompt = history.map((m) => `${m.role === "user" ? "Lead" : "SDR"}: ${m.content}`).join("\n")
  
  const response = await generateCompletion(systemPrompt, fullPrompt, {
    temperature: 0.7,
    maxTokens: 500,
  })

  // Save assistant message
  await prisma.message.create({
    data: { conversationId, role: "ASSISTANT", content: response },
  })

  // Update lead last message
  await prisma.lead.update({
    where: { id: leadId },
    data: { lastMessage: incomingMessage, updatedAt: new Date() },
  })

  // Check if we should score the lead
  const messageCount = messages.length + 2 // including the 2 new ones
  if (messageCount >= 6) {
    await scoreLead(leadId, companyId, messages.concat([
      { id: "", conversationId, role: "USER" as any, content: incomingMessage, createdAt: new Date(), metadata: null },
      { id: "", conversationId, role: "ASSISTANT" as any, content: response, createdAt: new Date(), metadata: null },
    ]))
  }

  return response
}

function buildSystemPrompt(settings: any, profile: any): string {
  const aiName = settings?.aiName || "Assistente"
  const tone = settings?.tone || "Consultivo, profissional e objetivo"
  const segment = settings?.segment || profile?.description || ""
  const products = settings?.products || profile?.services || ""
  const q1 = settings?.question1 || "Qual é o principal objetivo que você deseja resolver agora?"
  const q2 = settings?.question2 || "Qual é a urgência para resolver isso?"
  const q3 = settings?.question3 || "Você já possui orçamento definido ou está avaliando possibilidades?"
  const rules = settings?.rules || ""
  const canTalkPrice = settings?.canTalkPrice || "no"
  const forbidden = profile?.forbiddenTopics || ""
  const allowed = profile?.allowedTopics || ""
  const objections = profile?.commonObjections || ""
  const objectionAnswers = profile?.objectionAnswers || ""
  const differentials = profile?.differentials || ""
  const benefits = profile?.benefits || ""

  return `Você é ${aiName}, um SDR (Sales Development Representative) inteligente.
Seu tom é: ${tone}.
Você trabalha para uma empresa do segmento: ${segment}.
Produtos/Serviços: ${products}.
Diferenciais: ${differentials}.
Benefícios: ${benefits}.

FLUXO DE ATENDIMENTO:
1. Saudação breve e natural
2. Entender a necessidade do lead
3. Fazer pergunta classificatória 1: "${q1}"
4. Fazer pergunta classificatória 2: "${q2}"
5. Fazer pergunta classificatória 3: "${q3}"
6. Resumir o interesse
7. Sugerir reunião com 2 horários

REGRAS OBRIGATÓRIAS:
- Seja breve (máximo 2-3 frases por mensagem)
- Seja humano e consultivo
- Faça UMA pergunta por vez
- Não pressione demais
- Não prometa resultados irreais
- Não invente informações
- Sempre busque o próximo passo comercial
- Não responda assuntos fora do escopo
${canTalkPrice === "no" ? "- NÃO fale preço, direcione para reunião" : ""}
${forbidden ? `- NUNCA fale sobre: ${forbidden}` : ""}
${allowed ? `- Pode falar sobre: ${allowed}` : ""}
${rules ? `- Regras extras: ${rules}` : ""}

${objections ? `OBJEÇÕES COMUNS E RESPOSTAS:\n${objections}\n${objectionAnswers}` : ""}

Responda APENAS a mensagem do SDR. Sem prefixos, sem "SDR:", apenas o texto da resposta.
Responda em português do Brasil.`
}

async function scoreLead(leadId: string, companyId: string, messages: any[]) {
  try {
    const conversation = messages.map((m) => `${m.role}: ${m.content}`).join("\n")
    
    const scorePrompt = `Analise esta conversa e pontue o lead de 0 a 100 com base em:
- Clareza da dor (0-15)
- Urgência (0-15)
- Orçamento (0-15)
- Fit com solução (0-15)
- Engajamento (0-10)
- Intenção de compra (0-15)
- Potencial de receita (0-15)

Conversa:
${conversation}

Responda APENAS com um número inteiro de 0 a 100.`

    const result = await generateCompletion("Você é um analista de vendas. Responda apenas com o número do score.", scorePrompt, {
      temperature: 0.3,
      maxTokens: 10,
    })

    const score = parseInt(result.trim()) || 0
    const clampedScore = Math.min(100, Math.max(0, score))
    
    let classification: "COLD" | "WARM" | "HOT" = "COLD"
    if (clampedScore >= 70) classification = "HOT"
    else if (clampedScore >= 40) classification = "WARM"

    await prisma.lead.update({
      where: { id: leadId },
      data: { score: clampedScore, classification },
    })

    await prisma.leadScore.create({
      data: { leadId, criteria: "ai_conversation", value: clampedScore, reason: `Score baseado em ${messages.length} mensagens` },
    })
  } catch (error) {
    console.error("Error scoring lead:", error)
  }
}

export async function handleIncomingWhatsApp(phone: string, message: string, companyId: string): Promise<string> {
  // Find or create lead
  let lead = await prisma.lead.findFirst({
    where: { companyId, phone },
  })

  if (!lead) {
    lead = await prisma.lead.create({
      data: { companyId, phone, whatsapp: phone, status: "novo_lead", origin: "whatsapp" },
    })
  }

  // Update status if new
  if (lead.status === "novo_lead") {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "em_atendimento" },
    })
  }

  // Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: { leadId: lead.id, status: "ACTIVE" },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { companyId, leadId: lead.id, status: "ACTIVE" },
    })
  }

  // Process with AI
  const response = await processSDRMessage({
    companyId,
    leadId: lead.id,
    conversationId: conversation.id,
    incomingMessage: message,
  })

  // Log activity
  await prisma.activityLog.create({
    data: {
      companyId,
      type: "message_received",
      message: `Nova mensagem de ${lead.name || phone}: "${message.substring(0, 50)}..."`,
    },
  })

  return response
}
