import { generateCompletion } from "./openai-client"
import { prisma } from "@/lib/db"

// ==================== TYPES ====================

interface SDRContext {
  companyId: string
  leadId: string
  conversationId: string
  incomingMessage: string
  pushName?: string | null
}

type Intent = 
  | "greeting" 
  | "question" 
  | "objection" 
  | "interest" 
  | "scheduling" 
  | "price_ask" 
  | "complaint"
  | "off_topic"
  | "farewell"
  | "unknown"

type ConversationStage = 
  | "opening"        // First contact
  | "discovery"      // Understanding needs
  | "qualification"  // Asking qualifying questions
  | "presentation"   // Presenting solution
  | "objection_handling" // Handling objections
  | "closing"        // Suggesting meeting/next step
  | "scheduled"      // Meeting scheduled
  | "lost"           // Lead lost/unresponsive

// ==================== INTENT DETECTION ====================

function detectIntent(message: string): Intent {
  const lower = message.toLowerCase().trim()
  
  // Greetings
  if (/^(oi|olá|ola|hey|bom dia|boa tarde|boa noite|e ai|eai|fala|salve|hello|hi)\b/.test(lower)) {
    return "greeting"
  }
  
  // Price questions
  if (/pre[çc]o|valor|quanto custa|tabela|investimento|custo|or[çc]amento/.test(lower)) {
    return "price_ask"
  }
  
  // Objections
  if (/n[ãa]o (tenho|preciso|quero|posso)|caro|depois|agora n[ãa]o|sem (tempo|dinheiro|interesse)|j[áa] tenho|vou pensar|deixa pra l[áa]/.test(lower)) {
    return "objection"
  }
  
  // Scheduling intent
  if (/agendar|marcar|hor[áa]rio|reuni[ãa]o|call|disponibilidade|quando|dia|semana/.test(lower)) {
    return "scheduling"
  }
  
  // Complaints
  if (/reclama|problema|n[ãa]o funcio|ruim|p[ée]ssimo|insatisf/.test(lower)) {
    return "complaint"
  }
  
  // Interest signals
  if (/como funciona|me (explica|conta)|quero saber|interessado|gostaria|pode me|fale (mais|sobre)|o que voc[êe]s/.test(lower)) {
    return "interest"
  }
  
  // Questions
  if (/\?|como|quando|onde|por que|qual|quem/.test(lower)) {
    return "question"
  }
  
  // Farewell
  if (/tchau|at[ée] (mais|logo)|obrigad[ao]|vlw|falou|bye/.test(lower)) {
    return "farewell"
  }
  
  return "unknown"
}

// ==================== STAGE DETECTION ====================

function detectStage(messages: any[], currentStage?: string): ConversationStage {
  const msgCount = messages.length
  const lastMessages = messages.slice(-4)
  const hasQualifyingAnswers = messages.filter(m => 
    m.role === "USER" && m.content.length > 15
  ).length
  
  if (msgCount <= 2) return "opening"
  if (msgCount <= 4) return "discovery"
  if (hasQualifyingAnswers >= 2 && msgCount <= 8) return "qualification"
  if (hasQualifyingAnswers >= 3) return "presentation"
  
  // Check if objection was raised
  const lastUserMsg = lastMessages.filter(m => m.role === "USER").pop()
  if (lastUserMsg && detectIntent(lastUserMsg.content) === "objection") {
    return "objection_handling"
  }
  
  if (msgCount > 8) return "closing"
  
  return currentStage as ConversationStage || "discovery"
}

// ==================== MAIN SDR PROCESSOR ====================

export async function processSDRMessage(ctx: SDRContext): Promise<string> {
  const { companyId, leadId, conversationId, incomingMessage } = ctx

  // Load all context in parallel
  const [settings, profile, lead, messages, learnings] = await Promise.all([
    prisma.aiSettings.findUnique({ where: { companyId } }),
    prisma.companyProfile.findUnique({ where: { companyId } }),
    prisma.lead.findUnique({ where: { id: leadId } }),
    prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 30,
    }),
    prisma.sdrLearning?.findMany?.({
      where: { companyId, confidence: { gte: 0.6 } },
      orderBy: { confidence: "desc" },
      take: 10,
    }).catch(() => []),
  ])

  // Save incoming message
  await prisma.message.create({
    data: { conversationId, role: "USER", content: incomingMessage },
  })

  // Detect intent and stage
  const intent = detectIntent(incomingMessage)
  const stage = detectStage(messages, undefined)
  
  // Build advanced system prompt
  const systemPrompt = await buildAdvancedPrompt(settings, profile, lead, stage, intent, learnings || [], companyId)
  
  // Build conversation history (optimized for context window)
  const recentMessages = messages.slice(-15)
  const history = recentMessages.map((m) => 
    `${m.role === "USER" ? "Lead" : "SDR"}: ${m.content}`
  ).join("\n")
  
  const fullPrompt = `${history}\nLead: ${incomingMessage}`

  // Generate response
  const response = await generateCompletion(systemPrompt, fullPrompt, {
    temperature: 0.75,
    maxTokens: 400,
  })

  // Clean response
  const cleanResponse = response
    .replace(/^(SDR|Assistente|Assistant|Bot|AI):\s*/gi, "")
    .replace(/^["']|["']$/g, "")
    .trim()

  // Save assistant response
  await prisma.message.create({
    data: { conversationId, role: "ASSISTANT", content: cleanResponse },
  })

  // Update lead
  await prisma.lead.update({
    where: { id: leadId },
    data: { lastMessage: incomingMessage, updatedAt: new Date() },
  })

  // Score lead after 6+ messages
  const totalMessages = messages.length + 2
  if (totalMessages >= 6 && totalMessages % 3 === 0) {
    scoreLead(leadId, companyId, [...messages, 
      { role: "USER", content: incomingMessage } as any,
      { role: "ASSISTANT", content: cleanResponse } as any,
    ]).catch(console.error)
  }

  // Learn from the interaction (async, don't block)
  learnFromInteraction(companyId, intent, incomingMessage, cleanResponse, stage).catch(console.error)

  // Update conversation stats
  prisma.aiSettings.upsert({
    where: { companyId },
    update: { totalConversations: { increment: 0 } },
    create: { companyId, aiName: "Assistente" },
  }).catch(() => {})

  return cleanResponse
}

// ==================== ADVANCED PROMPT BUILDER ====================

async function buildAdvancedPrompt(
  settings: any, 
  profile: any, 
  lead: any,
  stage: ConversationStage,
  intent: Intent,
  learnings: any[],
  companyId: string
): Promise<string> {
  const aiName = settings?.aiName || "Assistente"
  const tone = settings?.tone || "Consultivo, profissional e objetivo"
  const personality = settings?.personality || "Humano, empático e estratégico"
  const segment = settings?.segment || profile?.description || ""
  const products = settings?.products || profile?.services || ""
  const differentials = profile?.differentials || ""
  const benefits = profile?.benefits || ""
  const painPoints = profile?.painPoints || ""
  const objections = profile?.commonObjections || ""
  const objectionAnswers = profile?.objectionAnswers || ""
  const rules = settings?.rules || ""
  const canTalkPrice = settings?.canTalkPrice || "no"
  const meetingLink = settings?.meetingLink || ""
  const businessHours = settings?.businessHours || "Seg-Sex 9h-18h"
  const humanResponsible = settings?.humanResponsible || "nosso consultor"
  const forbidden = profile?.forbiddenTopics || ""
  const initialMessage = settings?.initialMessage || ""

  // Stage-specific instructions
  const stageInstructions: Record<ConversationStage, string> = {
    opening: `ESTÁGIO ATUAL: ABERTURA
- Cumprimente brevemente e de forma natural
- Demonstre interesse genuíno
- Faça uma pergunta aberta para entender o contexto
- NÃO seja muito formal ou robótico`,
    
    discovery: `ESTÁGIO ATUAL: DESCOBERTA
- Aprofunde o entendimento da necessidade
- Use perguntas abertas
- Demonstre que está ouvindo (referencie algo que o lead disse)
- Identifique a DOR principal`,
    
    qualification: `ESTÁGIO ATUAL: QUALIFICAÇÃO
- Faça perguntas para entender: necessidade, urgência, orçamento, decisor
- Pergunte: "${settings?.question1 || "Qual é o principal objetivo que você deseja resolver?"}"
- Depois: "${settings?.question2 || "Qual é a urgência para resolver isso?"}"
- Por fim: "${settings?.question3 || "Você já possui orçamento definido?"}"
- Faça UMA pergunta por vez!`,
    
    presentation: `ESTÁGIO ATUAL: APRESENTAÇÃO
- Conecte os benefícios com a dor/necessidade que o lead expressou
- Seja específico e personalizado (use o que o lead disse antes)
- Mencione diferenciais relevantes
- Prepare o terreno para a proposta/reunião`,
    
    objection_handling: `ESTÁGIO ATUAL: TRATAMENTO DE OBJEÇÃO
- Valide o sentimento do lead ("Entendo perfeitamente...")
- Reformule a objeção como oportunidade
- Use provas sociais ou dados se possível
- Retorne ao benefício principal
- NÃO insista excessivamente, seja elegante`,
    
    closing: `ESTÁGIO ATUAL: FECHAMENTO
- Sugira o próximo passo concreto (reunião, demonstração, etc.)
- Ofereça 2-3 opções de horário
${meetingLink ? `- Link de agendamento: ${meetingLink}` : "- Proponha horários disponíveis"}
- Facilite ao máximo para o lead dizer "sim"
- Se o Google Calendar estiver integrado, os horários sugeridos são horários reais disponíveis na agenda`,
    
    scheduled: `ESTÁGIO ATUAL: REUNIÃO AGENDADA
- Confirme o agendamento
- Envie informações relevantes para a reunião
- Pergunte se há algo a preparar
- Seja breve e positivo`,
    
    lost: `ESTÁGIO ATUAL: REATIVAÇÃO
- Retome contato de forma não invasiva
- Ofereça algo de valor (conteúdo, novidade)
- Não pressione, seja genuíno`,
  }

  // Intent-specific guidance
  const intentGuidance: Partial<Record<Intent, string>> = {
    price_ask: canTalkPrice === "no" 
      ? "O lead perguntou sobre preço. NÃO informe valores. Diga algo como: 'Para informar o investimento ideal, preciso entender melhor sua necessidade. Podemos agendar 15 min para eu apresentar as opções certas para você?'"
      : canTalkPrice === "range"
      ? "O lead perguntou sobre preço. Pode dar uma FAIXA de preço, mas incentive a reunião para personalizar."
      : "O lead perguntou sobre preço. Pode informar valores quando relevante.",
    
    objection: `O lead levantou uma objeção. Use a técnica:
1. ACOLHA: "Entendo, é uma preocupação válida..."
2. REFORMULE: Mostre outro ângulo
3. EVIDENCIE: Traga um dado ou caso
4. REDIRECIONE: Volte ao benefício principal`,
    
    scheduling: "O lead está interessado em agendar! Facilite ao máximo. Ofereça horários concretos.",
    
    farewell: "O lead está se despedindo. Agradeça e deixe a porta aberta. Se não qualificou ainda, tente um micro-compromisso.",
    
    off_topic: "Traga gentilmente a conversa de volta ao assunto comercial.",
  }

  // Learned patterns
  const learnedPatternsText = learnings.length > 0
    ? `\nAPRENDIZADOS DE CONVERSAS ANTERIORES:\n${learnings.slice(0, 5).map(l => 
        `- ${l.type}: "${l.trigger?.substring(0, 60)}" → Resposta eficaz: "${l.response?.substring(0, 80)}"`
      ).join("\n")}`
    : ""

  // Lead context
  const leadContext = lead
    ? `\nCONTEXTO DO LEAD:
- Nome: ${lead.name || "Não informado"}
- Score: ${lead.score}/100 (${lead.classification})
- Status: ${lead.status}
- Origem: ${lead.origin || "WhatsApp"}
${lead.interest ? `- Interesse: ${lead.interest}` : ""}
${lead.notes ? `- Observações: ${lead.notes}` : ""}`
    : ""

  const basePrompt = `Você é ${aiName}, um SDR (Sales Development Representative) de alto desempenho.
Personalidade: ${personality}.
Tom de comunicação: ${tone}.

EMPRESA E CONTEXTO:
- Segmento: ${segment}
- Produtos/Serviços: ${products}
${differentials ? `- Diferenciais: ${differentials}` : ""}
${benefits ? `- Benefícios: ${benefits}` : ""}
${painPoints ? `- Dores que resolvemos: ${painPoints}` : ""}
- Horário de atendimento: ${businessHours}
- Responsável para reuniões: ${humanResponsible}
${leadContext}

${stageInstructions[stage]}

${intentGuidance[intent] || ""}
${learnedPatternsText}

TÉCNICAS AVANÇADAS DE SDR:
1. ESPELHAMENTO: Repita brevemente algo que o lead disse para mostrar que está ouvindo
2. PERGUNTAS SOCRÁTICAS: Guie o lead a concluir sozinho que precisa da solução
3. MICRO-COMPROMISSOS: Busque pequenos "sim" antes do grande pedido
4. PROVA SOCIAL: Mencione que outros no mesmo segmento obtiveram resultados
5. ESCASSEZ AUTÊNTICA: Se houver, mencione limitações reais (vagas, período, etc.)
6. FOCO NA DOR: A dor motiva 3x mais que o prazer
7. STORYTELLING: Use mini-histórias de 1 frase para ilustrar pontos

${objections ? `OBJEÇÕES CONHECIDAS:\n${objections}\nRespostas sugeridas: ${objectionAnswers}` : ""}

REGRAS INVIOLÁVEIS:
- Máximo 2-3 frases por mensagem (WhatsApp = mensagens curtas!)
- NUNCA mande parágrafos longos
- Seja genuinamente humano (use emoji com moderação, 1-2 por msg max)
- Faça UMA pergunta por vez
- NÃO invente informações ou dados
- NÃO seja genérico — personalize baseado no que o lead disse
- Sempre tenha um CTA (call-to-action) implícito ou explícito
- Responda em português do Brasil natural
- NÃO use formatação markdown (bold, itálico) — é WhatsApp
- NÃO use prefixos como "SDR:", "Assistente:", etc.
${rules ? `- ${rules}` : ""}
${forbidden ? `- NUNCA fale sobre: ${forbidden}` : ""}

Responda APENAS com o texto da mensagem. Seja breve, humano e estratégico.`

  // Inject available scheduling slots if in closing stage or scheduling intent
  if (stage === "closing" || intent === "scheduling") {
    try {
      const { getSuggestedSlots } = await import("@/lib/google-calendar")
      const slots = await getSuggestedSlots(companyId)
      if (slots.length > 0) {
        const slotsText = slots.map(s => `${s.date} às ${s.time}`).join(" | ")
        return basePrompt + `\n\nHORÁRIOS DISPONÍVEIS NA AGENDA (reais, do Google Calendar):\n${slotsText}\nUse esses horários ao sugerir reunião. São horários confirmadamente livres.`
      }
    } catch {}
  }

  return basePrompt
}

// ==================== LEAD SCORING ====================

async function scoreLead(leadId: string, companyId: string, messages: any[]) {
  try {
    const conversation = messages.slice(-15).map((m) => 
      `${m.role === "USER" ? "Lead" : "SDR"}: ${m.content}`
    ).join("\n")
    
    const scorePrompt = `Analise esta conversa comercial e pontue o lead de 0 a 100.

CRITÉRIOS:
- Clareza da dor/necessidade (0-20): O lead expressou uma dor clara?
- Urgência (0-20): Há pressa para resolver?
- Capacidade de investimento (0-15): Deu sinais de orçamento?
- Fit com a solução (0-15): A necessidade casa com o que oferecemos?
- Engajamento (0-15): Está respondendo bem? Faz perguntas?
- Sinal de compra (0-15): Pediu proposta? Perguntou preço? Quer agendar?

CLASSIFICAÇÃO:
- 0-30: COLD (frio - sem interesse claro)
- 31-60: WARM (morno - interesse inicial)
- 61-100: HOT (quente - pronto para converter)

Conversa:
${conversation}

Responda APENAS neste formato JSON:
{"score": <número>, "classification": "<COLD|WARM|HOT>", "reason": "<motivo em 1 frase>", "nextAction": "<sugestão de próximo passo>"}`

    const result = await generateCompletion(
      "Você é um analista de vendas especializado em lead scoring. Responda apenas com JSON válido.", 
      scorePrompt, 
      { temperature: 0.3, maxTokens: 150 }
    )

    let scoreData: any = {}
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      scoreData = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 30 }
    } catch {
      const numMatch = result.match(/\d+/)
      scoreData = { score: numMatch ? parseInt(numMatch[0]) : 30 }
    }

    const score = Math.min(100, Math.max(0, scoreData.score || 30))
    let classification: "COLD" | "WARM" | "HOT" = "COLD"
    if (score >= 61) classification = "HOT"
    else if (score >= 31) classification = "WARM"

    await prisma.lead.update({
      where: { id: leadId },
      data: { 
        score, 
        classification,
        nextAction: scoreData.nextAction || null,
        interest: scoreData.reason || null,
      },
    })

    await prisma.leadScore.create({
      data: { 
        leadId, 
        criteria: "ai_conversation_v2", 
        value: score, 
        reason: scoreData.reason || `Score: ${score}` 
      },
    })

    // If HOT lead, update status
    if (classification === "HOT") {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: "qualificado" },
      })
    }
  } catch (error) {
    console.error("Error scoring lead:", error)
  }
}

// ==================== LEARNING SYSTEM ====================

async function learnFromInteraction(
  companyId: string,
  intent: Intent,
  userMessage: string,
  aiResponse: string,
  stage: ConversationStage
) {
  try {
    // Only learn from specific intents
    if (!["objection", "interest", "scheduling", "price_ask"].includes(intent)) return

    // Check if SdrLearning model exists
    const existingLearning = await prisma.sdrLearning?.findFirst?.({
      where: { companyId, trigger: userMessage.substring(0, 200) },
    }).catch(() => null)

    if (existingLearning) {
      // Update usage count
      await prisma.sdrLearning?.update?.({
        where: { id: existingLearning.id },
        data: { usageCount: { increment: 1 } },
      }).catch(() => {})
    } else {
      // Create new learning
      await prisma.sdrLearning?.create?.({
        data: {
          companyId,
          type: intent === "objection" ? "objection" : 
                intent === "scheduling" ? "success_pattern" : "insight",
          trigger: userMessage.substring(0, 500),
          response: aiResponse.substring(0, 500),
          outcome: "pending",
          confidence: 0.5,
        },
      }).catch(() => {})
    }
  } catch (error) {
    // Silently fail - learning is non-critical
  }
}

// ==================== HANDLE INCOMING (simplified entry point) ====================

export async function handleIncomingWhatsApp(phone: string, message: string, companyId: string, pushName?: string | null): Promise<string> {
  // Find or create lead
  let lead = await prisma.lead.findFirst({
    where: { companyId, phone },
  })

  if (!lead) {
    lead = await prisma.lead.create({
      data: { companyId, phone, whatsapp: phone, name: pushName, status: "novo_lead", origin: "whatsapp" },
    })
  }

  // Update status
  if (lead.status === "novo_lead") {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "em_atendimento" },
    })
  }

  // Update name if missing
  if (!lead.name && pushName) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { name: pushName },
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

  // Process with advanced SDR
  const response = await processSDRMessage({
    companyId,
    leadId: lead.id,
    conversationId: conversation.id,
    incomingMessage: message,
    pushName,
  })

  // Log activity
  await prisma.activityLog.create({
    data: {
      companyId,
      type: "message_received",
      message: `Mensagem de ${lead.name || phone}: "${message.substring(0, 50)}"`,
    },
  })

  return response
}
