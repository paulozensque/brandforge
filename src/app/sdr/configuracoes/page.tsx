"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ConfiguracoesIAPage() {
  const [form, setForm] = useState({
    aiName: "Assistente Zen",
    tone: "Consultivo, profissional e objetivo",
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

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  return (
    <AppShell>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Configurações da IA</h1>
          <p className="text-muted-foreground mt-1">Personalize o comportamento do SDR IA.</p>
        </div>

        <div className="space-y-6">
          {/* Identidade */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">🤖 Identidade da IA</h2>
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
              <Input value={form.tone} onChange={(e) => update("tone", e.target.value)} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Ex: Consultivo, humano, direto, amigável...</p>
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
            <p className="text-xs text-muted-foreground">A IA fará essas 3 perguntas para qualificar o lead.</p>
            <div>
              <label className="text-sm font-medium">Pergunta 1 (Necessidade)</label>
              <Input value={form.question1} onChange={(e) => update("question1", e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Pergunta 2 (Urgência)</label>
              <Input value={form.question2} onChange={(e) => update("question2", e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Pergunta 3 (Orçamento)</label>
              <Input value={form.question3} onChange={(e) => update("question3", e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Critérios adicionais de qualificação</label>
              <Textarea value={form.qualificationCriteria} onChange={(e) => update("qualificationCriteria", e.target.value)} placeholder="Ex: priorizar leads com budget acima de R$ 5k, região SP..." className="mt-1" rows={3} />
            </div>
          </section>

          {/* Mensagens */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">💬 Mensagens & Regras</h2>
            <div>
              <label className="text-sm font-medium">Mensagem inicial</label>
              <Textarea value={form.initialMessage} onChange={(e) => update("initialMessage", e.target.value)} className="mt-1" rows={3} />
              <p className="text-xs text-muted-foreground mt-1">Use {"{empresa}"} para inserir o nome da empresa.</p>
            </div>
            <div>
              <label className="text-sm font-medium">Regras do atendimento</label>
              <Textarea value={form.rules} onChange={(e) => update("rules", e.target.value)} placeholder="Regras específicas que a IA deve seguir..." className="mt-1" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium">Pode falar preço?</label>
              <select value={form.canTalkPrice} onChange={(e) => update("canTalkPrice", e.target.value)} className="w-full h-10 rounded-md border px-3 text-sm mt-1">
                <option value="no">Não - direcionar para reunião</option>
                <option value="range">Sim - faixa de preço</option>
                <option value="yes">Sim - preços exatos</option>
              </select>
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

          <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            💾 Salvar Configurações
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
