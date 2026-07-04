"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ConfiguracoesIAPage() {
  const [form, setForm] = useState({
    aiName: "Assistente Zen",
    tone: "Consultivo, profissional e objetivo",
    personality: "Humano, empático e estratégico",
    segment: "",
    products: "",
    question1: "Qual é o principal objetivo que você deseja resolver agora?",
    question2: "Qual é a urgência para resolver isso?",
    question3: "Você já possui orçamento definido ou está avaliando possibilidades?",
    qualificationCriteria: "",
    initialMessage: "Olá! 👋 Tudo bem? Sou o assistente comercial da {empresa}. Como posso ajudar você hoje?",
    rules: "",
    canTalkPrice: "no",
    businessHours: "Seg-Sex 9h-18h",
    meetingLink: "",
    humanResponsible: "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [stats, setStats] = useState({ totalConversations: 0, conversionsCount: 0, conversionRate: 0 })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/sdr/settings")
      if (res.ok) {
        const data = await res.json()
        if (data && data.aiName) {
          setForm(f => ({ ...f, ...data }))
          setStats({
            totalConversations: data.totalConversations || 0,
            conversionsCount: data.conversionsCount || 0,
            conversionRate: data.conversionRate || 0,
          })
        }
      }
    } catch {}
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/sdr/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {}
    setSaving(false)
  }

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const toneOptions = [
    "Consultivo, profissional e objetivo",
    "Amigável, leve e descontraído",
    "Direto, assertivo e prático",
    "Empático, acolhedor e paciente",
    "Entusiasmado, energético e motivador",
  ]

  const personalityOptions = [
    "Humano, empático e estratégico",
    "Analítico, preciso e confiante",
    "Criativo, curioso e dinâmico",
    "Calmo, paciente e conselheiro",
    "Enérgico, desafiador e inspirador",
  ]

  return (
    <AppShell>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">🧠 Configurações do SDR IA</h1>
          <p className="text-muted-foreground mt-1">Personalize o comportamento, personalidade e aprendizagem do assistente.</p>
        </div>

        {/* Performance Stats */}
        {stats.totalConversations > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-card rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Conversas Totais</p>
              <p className="text-xl font-bold text-emerald-600">{stats.totalConversations}</p>
            </div>
            <div className="bg-card rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Conversões</p>
              <p className="text-xl font-bold text-blue-600">{stats.conversionsCount}</p>
            </div>
            <div className="bg-card rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
              <p className="text-xl font-bold text-purple-600">{(stats.conversionRate * 100).toFixed(1)}%</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Identidade */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">🤖 Identidade & Personalidade</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome da IA</label>
                <Input value={form.aiName} onChange={(e) => update("aiName", e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Responsável humano</label>
                <Input value={form.humanResponsible} onChange={(e) => update("humanResponsible", e.target.value)} placeholder="Nome para handoff" className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Tom de voz</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {toneOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => update("tone", opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      form.tone === opt ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium" : "border-gray-200 hover:bg-accent"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Personalidade</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {personalityOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => update("personality", opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      form.personality === opt ? "border-violet-500 bg-violet-50 text-violet-700 font-medium" : "border-gray-200 hover:bg-accent"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Segmento da empresa</label>
              <Input value={form.segment} onChange={(e) => update("segment", e.target.value)} placeholder="Ex: Marketing Digital, Consultoria, E-commerce..." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Produtos/Serviços</label>
              <Textarea value={form.products} onChange={(e) => update("products", e.target.value)} placeholder="Liste seus produtos e serviços principais..." className="mt-1" rows={3} />
            </div>
          </section>

          {/* Qualificação */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">❓ Perguntas Classificatórias</h2>
            <p className="text-xs text-muted-foreground">A IA fará essas perguntas naturalmente durante a conversa para qualificar o lead.</p>
            <div>
              <label className="text-sm font-medium">Pergunta 1 — Necessidade/Dor</label>
              <Input value={form.question1} onChange={(e) => update("question1", e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Pergunta 2 — Urgência</label>
              <Input value={form.question2} onChange={(e) => update("question2", e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Pergunta 3 — Orçamento/Decisão</label>
              <Input value={form.question3} onChange={(e) => update("question3", e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Critérios extras de qualificação</label>
              <Textarea value={form.qualificationCriteria} onChange={(e) => update("qualificationCriteria", e.target.value)} placeholder="Ex: priorizar leads com budget acima de R$ 5k, região SP..." className="mt-1" rows={2} />
            </div>
          </section>

          {/* Comportamento */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">⚙️ Comportamento & Regras</h2>
            <div>
              <label className="text-sm font-medium">Mensagem inicial (primeira interação)</label>
              <Textarea value={form.initialMessage} onChange={(e) => update("initialMessage", e.target.value)} className="mt-1" rows={2} />
              <p className="text-xs text-muted-foreground mt-1">Use {"{empresa}"} para inserir o nome da empresa.</p>
            </div>
            <div>
              <label className="text-sm font-medium">Regras do atendimento</label>
              <Textarea value={form.rules} onChange={(e) => update("rules", e.target.value)} placeholder="Regras específicas que a IA deve seguir..." className="mt-1" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium">Pode falar preço?</label>
              <div className="flex gap-2 mt-2">
                {[
                  { value: "no", label: "❌ Não — direcionar para reunião" },
                  { value: "range", label: "📊 Faixa de preço apenas" },
                  { value: "yes", label: "✅ Sim — preços exatos" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update("canTalkPrice", opt.value)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs border transition-all text-center ${
                      form.canTalkPrice === opt.value ? "border-emerald-500 bg-emerald-50 font-medium" : "border-gray-200 hover:bg-accent"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Horários de atendimento</label>
                <Input value={form.businessHours} onChange={(e) => update("businessHours", e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Link de reunião</label>
                <Input value={form.meetingLink} onChange={(e) => update("meetingLink", e.target.value)} placeholder="https://calendly.com/..." className="mt-1" />
              </div>
            </div>
          </section>

          {/* Aprendizagem */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">🧠 Sistema de Aprendizagem</h2>
            <p className="text-xs text-muted-foreground">
              O SDR IA aprende automaticamente com cada conversa. Ele identifica padrões de sucesso, objeções comuns e melhores respostas.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-xs font-medium text-emerald-800 mb-1">✅ O que a IA aprende:</p>
                <ul className="text-[11px] text-emerald-700 space-y-0.5">
                  <li>• Objeções mais comuns e melhores respostas</li>
                  <li>• Padrões de conversa que convertem</li>
                  <li>• Frases que geram engajamento</li>
                  <li>• Timing ideal de follow-up</li>
                </ul>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-800 mb-1">📈 Como melhora:</p>
                <ul className="text-[11px] text-blue-700 space-y-0.5">
                  <li>• Cada conversa aumenta a base de conhecimento</li>
                  <li>• Respostas bem-sucedidas ganham peso</li>
                  <li>• Respostas ruins são descartadas</li>
                  <li>• Adaptação ao perfil dos seus leads</li>
                </ul>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                💡 <strong>Dica:</strong> Quanto mais conversas o SDR IA tiver, melhor ele fica. Nas primeiras 50 conversas ele calibra o tom e descobre o que funciona. Após 100+ conversas, ele se torna significativamente mais eficaz.
              </p>
            </div>
          </section>

          {/* Save */}
          <Button 
            size="lg" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? "Salvando..." : saved ? "✅ Salvo!" : "💾 Salvar Configurações"}
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
