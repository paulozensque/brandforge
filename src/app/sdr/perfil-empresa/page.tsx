"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

export default function PerfilEmpresaPage() {
  const [form, setForm] = useState({
    description: "",
    history: "",
    mission: "",
    vision: "",
    values: "",
    services: "",
    serviceDetails: "",
    targetAudience: "",
    serviceRegion: "",
    differentials: "",
    painPoints: "",
    benefits: "",
    commonObjections: "",
    objectionAnswers: "",
    faq: "",
    pricingPolicy: "",
    averageTicket: "",
    paymentMethods: "",
    businessHours: "",
    commercialRules: "",
    allowedTopics: "",
    forbiddenTopics: "",
    humanHandoffRules: "",
    website: "",
    instagram: "",
    catalogUrl: "",
    supportMaterials: "",
  })

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  // Calculate completion
  const totalFields = Object.keys(form).length
  const filledFields = Object.values(form).filter((v) => v.trim().length > 0).length
  const completion = Math.round((filledFields / totalFields) * 100)

  const getStatus = () => {
    if (completion === 0) return { label: "Perfil incompleto", color: "text-red-600" }
    if (completion < 40) return { label: "Perfil básico", color: "text-amber-600" }
    if (completion < 75) return { label: "Perfil avançado", color: "text-blue-600" }
    return { label: "Perfil completo", color: "text-emerald-600" }
  }

  const status = getStatus()

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Perfil da Empresa</h1>
          <p className="text-muted-foreground mt-1">
            Base de conhecimento do SDR IA. Quanto mais completo, melhor o atendimento.
          </p>
        </div>

        {/* Progress */}
        <div className="bg-card rounded-xl border p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
            <span className="text-sm text-muted-foreground">{completion}%</span>
          </div>
          <Progress value={completion} />
        </div>

        <div className="space-y-8">
          {/* Sobre a empresa */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">🏛️ Sobre a Empresa</h2>
            <Field label="Descrição detalhada" help="O que sua empresa faz, para quem vende, quais problemas resolve e quais resultados entrega." value={form.description} onChange={(v) => update("description", v)} textarea />
            <Field label="História da empresa" help="Como surgiu, motivações, trajetória." value={form.history} onChange={(v) => update("history", v)} textarea />
            <div className="grid grid-cols-3 gap-4">
              <Field label="Missão" value={form.mission} onChange={(v) => update("mission", v)} />
              <Field label="Visão" value={form.vision} onChange={(v) => update("vision", v)} />
              <Field label="Valores" value={form.values} onChange={(v) => update("values", v)} />
            </div>
          </section>

          {/* Serviços */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">📦 Produtos & Serviços</h2>
            <Field label="Produtos/Serviços oferecidos" help="Liste todos os seus produtos e serviços." value={form.services} onChange={(v) => update("services", v)} textarea />
            <Field label="Descrição detalhada de cada serviço" help="Explique o que cada serviço inclui, como funciona e para quem é." value={form.serviceDetails} onChange={(v) => update("serviceDetails", v)} textarea />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ticket médio" value={form.averageTicket} onChange={(v) => update("averageTicket", v)} />
              <Field label="Formas de pagamento" value={form.paymentMethods} onChange={(v) => update("paymentMethods", v)} />
            </div>
            <Field label="Política de preços" help="Como funciona sua precificação, descontos, condições especiais." value={form.pricingPolicy} onChange={(v) => update("pricingPolicy", v)} textarea />
          </section>

          {/* Público */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">👥 Público & Mercado</h2>
            <Field label="Público-alvo ideal" help="Quem é seu cliente ideal? Cargo, empresa, comportamento." value={form.targetAudience} onChange={(v) => update("targetAudience", v)} textarea />
            <Field label="Região de atendimento" value={form.serviceRegion} onChange={(v) => update("serviceRegion", v)} />
            <Field label="Diferenciais competitivos" help="O que te diferencia da concorrência." value={form.differentials} onChange={(v) => update("differentials", v)} textarea />
            <Field label="Principais dores que resolve" value={form.painPoints} onChange={(v) => update("painPoints", v)} textarea />
            <Field label="Principais benefícios entregues" value={form.benefits} onChange={(v) => update("benefits", v)} textarea />
          </section>

          {/* Objeções e FAQ */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">❓ Objeções & FAQ</h2>
            <Field label="Objeções mais comuns" help="Ex: 'Está caro', 'Preciso pensar', 'Já tenho fornecedor'." value={form.commonObjections} onChange={(v) => update("commonObjections", v)} textarea />
            <Field label="Respostas para objeções" help="Como o SDR deve responder cada objeção." value={form.objectionAnswers} onChange={(v) => update("objectionAnswers", v)} textarea />
            <Field label="Perguntas frequentes" help="Perguntas que seus leads costumam fazer." value={form.faq} onChange={(v) => update("faq", v)} textarea />
          </section>

          {/* Regras da IA */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">⚙️ Regras do Atendimento</h2>
            <Field label="Horários de atendimento" value={form.businessHours} onChange={(v) => update("businessHours", v)} />
            <Field label="Regras comerciais" help="Políticas que a IA deve seguir." value={form.commercialRules} onChange={(v) => update("commercialRules", v)} textarea />
            <Field label="O que a IA PODE falar" help="Assuntos e informações permitidas." value={form.allowedTopics} onChange={(v) => update("allowedTopics", v)} textarea />
            <Field label="O que a IA NÃO PODE falar" help="Assuntos proibidos, promessas que não pode fazer." value={form.forbiddenTopics} onChange={(v) => update("forbiddenTopics", v)} textarea />
            <Field label="Quando chamar um humano" help="Situações em que a IA deve transferir para uma pessoa." value={form.humanHandoffRules} onChange={(v) => update("humanHandoffRules", v)} textarea />
          </section>

          {/* Links */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">🔗 Links Importantes</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Website" value={form.website} onChange={(v) => update("website", v)} />
              <Field label="Instagram" value={form.instagram} onChange={(v) => update("instagram", v)} />
            </div>
            <Field label="Link do catálogo" value={form.catalogUrl} onChange={(v) => update("catalogUrl", v)} />
            <Field label="Materiais de apoio" help="Links para apresentações, PDFs, vídeos." value={form.supportMaterials} onChange={(v) => update("supportMaterials", v)} textarea />
          </section>

          <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            💾 Salvar Perfil da Empresa
          </Button>
        </div>
      </div>
    </AppShell>
  )
}

function Field({ label, help, value, onChange, textarea }: {
  label: string
  help?: string
  value: string
  onChange: (v: string) => void
  textarea?: boolean
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {help && <p className="text-xs text-muted-foreground mb-1">{help}</p>}
      {textarea ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="mt-1" rows={3} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1" />
      )}
    </div>
  )
}
