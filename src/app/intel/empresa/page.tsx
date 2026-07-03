"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/forms/tag-input"

const STORAGE_KEY = "eco-intel-empresa-form"
const RESULT_KEY = "eco-intel-empresa-result"

export default function AnaliseEmpresaPage() {
  const [loading, setLoading] = useState(false)
  const [reportId, setReportId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(true)
  const [form, setForm] = useState({
    // Dados da empresa
    name: "",
    industry: "",
    segment: "",
    website: "",
    location: "",
    teamSize: "",
    revenue: "",
    yearsInMarket: "",
    // Produto/Serviço
    mainProducts: [] as string[],
    priceRange: "",
    avgTicket: "",
    deliveryModel: "", // digital, fisico, hibrido
    // Identidade atual
    currentPositioning: "",
    currentPromise: "",
    currentDifferentials: [] as string[],
    currentProblems: "",
    // Público
    targetAudience: "",
    audiencePains: [] as string[],
    audienceDesires: [] as string[],
    // Branding desejado
    brandTone: [] as string[],
    brandValues: [] as string[],
    inspirations: [] as string[],
    // Objetivos
    goals: "",
    timeline: "",
    monthlyBudget: "",
  })

  const update = (field: string, value: any) => {
    setForm((f) => {
      const updated = { ...f, [field]: value }
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  // Load saved form and result from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setForm(JSON.parse(saved))
      const savedResult = localStorage.getItem(RESULT_KEY)
      if (savedResult) {
        setReportId(JSON.parse(savedResult).reportId)
        setShowForm(false)
      }
    }
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/intel/empresa/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (!response.ok) throw new Error("Failed")
      const data = await response.json()
      setReportId(data.reportId)
      setShowForm(false)
      localStorage.setItem(RESULT_KEY, JSON.stringify({ reportId: data.reportId }))
    } catch (error) {
      alert("Erro ao gerar análise. Verifique os campos e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleNewAnalysis = () => {
    setShowForm(true)
    setReportId(null)
    localStorage.removeItem(RESULT_KEY)
  }

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Análise da Empresa</h1>
            <p className="text-muted-foreground mt-1">
              Preencha os dados para gerar uma análise estratégica completa com base nas metodologias The Futur e King Kong.
            </p>
          </div>
          {!showForm && reportId && (
            <Button variant="outline" onClick={handleNewAnalysis}>+ Nova Análise</Button>
          )}
        </div>

        {/* Show results if we have a reportId */}
        {!showForm && reportId && <EmpresaResults reportId={reportId} />}

        {/* Show form */}
        {showForm && (
        <div className="space-y-8">
          {/* Seção 1: Dados básicos */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">🏢 Dados da Empresa</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome da empresa *</label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ex: Minha Empresa" />
              </div>
              <div>
                <label className="text-sm font-medium">Indústria *</label>
                <Input value={form.industry} onChange={(e) => update("industry", e.target.value)} placeholder="Ex: Marketing Digital" />
              </div>
              <div>
                <label className="text-sm font-medium">Segmento</label>
                <Input value={form.segment} onChange={(e) => update("segment", e.target.value)} placeholder="Ex: SaaS B2B" />
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="text-sm font-medium">Localização</label>
                <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Ex: São Paulo, BR" />
              </div>
              <div>
                <label className="text-sm font-medium">Tamanho da equipe</label>
                <Input value={form.teamSize} onChange={(e) => update("teamSize", e.target.value)} placeholder="Ex: 5-10 pessoas" />
              </div>
              <div>
                <label className="text-sm font-medium">Faturamento mensal</label>
                <Input value={form.revenue} onChange={(e) => update("revenue", e.target.value)} placeholder="Ex: R$ 50.000" />
              </div>
              <div>
                <label className="text-sm font-medium">Anos no mercado</label>
                <Input value={form.yearsInMarket} onChange={(e) => update("yearsInMarket", e.target.value)} placeholder="Ex: 3 anos" />
              </div>
            </div>
          </section>

          {/* Seção 2: Produtos */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">📦 Produtos & Serviços</h2>
            <div>
              <label className="text-sm font-medium">Principais produtos/serviços</label>
              <TagInput value={form.mainProducts} onChange={(v) => update("mainProducts", v)} placeholder="Digite e pressione Enter" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Faixa de preço</label>
                <Input value={form.priceRange} onChange={(e) => update("priceRange", e.target.value)} placeholder="Ex: R$ 500 - R$ 5.000" />
              </div>
              <div>
                <label className="text-sm font-medium">Ticket médio</label>
                <Input value={form.avgTicket} onChange={(e) => update("avgTicket", e.target.value)} placeholder="Ex: R$ 2.000" />
              </div>
              <div>
                <label className="text-sm font-medium">Modelo de entrega</label>
                <select value={form.deliveryModel} onChange={(e) => update("deliveryModel", e.target.value)} className="w-full h-10 rounded-md border px-3 text-sm">
                  <option value="">Selecione</option>
                  <option value="digital">Digital</option>
                  <option value="fisico">Físico</option>
                  <option value="hibrido">Híbrido</option>
                  <option value="servico">Serviço/Consultoria</option>
                </select>
              </div>
            </div>
          </section>

          {/* Seção 3: Posicionamento atual */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">🎯 Posicionamento Atual</h2>
            <div>
              <label className="text-sm font-medium">Como você se posiciona hoje?</label>
              <Textarea value={form.currentPositioning} onChange={(e) => update("currentPositioning", e.target.value)} placeholder="Descreva como sua empresa se apresenta para o mercado hoje..." />
            </div>
            <div>
              <label className="text-sm font-medium">Qual sua promessa atual ao cliente?</label>
              <Textarea value={form.currentPromise} onChange={(e) => update("currentPromise", e.target.value)} placeholder="O que você promete entregar para o cliente?" />
            </div>
            <div>
              <label className="text-sm font-medium">Diferenciais atuais</label>
              <TagInput value={form.currentDifferentials} onChange={(v) => update("currentDifferentials", v)} placeholder="O que te diferencia da concorrência?" />
            </div>
            <div>
              <label className="text-sm font-medium">Problemas atuais</label>
              <Textarea value={form.currentProblems} onChange={(e) => update("currentProblems", e.target.value)} placeholder="Quais problemas de branding/vendas/posicionamento você enfrenta hoje?" />
            </div>
          </section>

          {/* Seção 4: Público */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">👥 Público-Alvo</h2>
            <div>
              <label className="text-sm font-medium">Descreva seu cliente ideal *</label>
              <Textarea value={form.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} placeholder="Quem é seu cliente ideal? (cargo, idade, empresa, comportamento...)" />
            </div>
            <div>
              <label className="text-sm font-medium">Dores do público</label>
              <TagInput value={form.audiencePains} onChange={(v) => update("audiencePains", v)} placeholder="Principais dores/problemas do seu público" />
            </div>
            <div>
              <label className="text-sm font-medium">Desejos do público</label>
              <TagInput value={form.audienceDesires} onChange={(v) => update("audienceDesires", v)} placeholder="O que seu público mais deseja alcançar?" />
            </div>
          </section>

          {/* Seção 5: Branding desejado */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">✨ Branding & Personalidade</h2>
            <div>
              <label className="text-sm font-medium">Tom de voz desejado</label>
              <TagInput value={form.brandTone} onChange={(v) => update("brandTone", v)} placeholder="Ex: Profissional, Ousado, Premium..." />
            </div>
            <div>
              <label className="text-sm font-medium">Valores da marca</label>
              <TagInput value={form.brandValues} onChange={(v) => update("brandValues", v)} placeholder="Ex: Inovação, Transparência, Resultado..." />
            </div>
            <div>
              <label className="text-sm font-medium">Marcas de inspiração</label>
              <TagInput value={form.inspirations} onChange={(v) => update("inspirations", v)} placeholder="Marcas que você admira (qualquer nicho)" />
            </div>
          </section>

          {/* Seção 6: Objetivos */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">🎯 Objetivos</h2>
            <div>
              <label className="text-sm font-medium">Qual seu principal objetivo? *</label>
              <Textarea value={form.goals} onChange={(e) => update("goals", e.target.value)} placeholder="Ex: Dobrar o faturamento, reposicionar a marca, aumentar autoridade..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Timeline</label>
                <Input value={form.timeline} onChange={(e) => update("timeline", e.target.value)} placeholder="Ex: 6 meses" />
              </div>
              <div>
                <label className="text-sm font-medium">Budget mensal para marketing</label>
                <Input value={form.monthlyBudget} onChange={(e) => update("monthlyBudget", e.target.value)} placeholder="Ex: R$ 5.000" />
              </div>
            </div>
          </section>

          <Button onClick={handleSubmit} disabled={loading || !form.name || !form.industry} size="lg" className="w-full gradient-brand text-white">
            {loading ? "🧠 Gerando análise com IA..." : "🚀 Gerar Análise Estratégica Completa"}
          </Button>
        </div>
        )}
      </div>
    </AppShell>
  )
}

function EmpresaResults({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("transformacao")

  useEffect(() => {
    const fetchReport = async () => {
      const res = await fetch(`/api/brand-report/${reportId}`)
      if (res.ok) setReport(await res.json())
      setLoading(false)
    }
    fetchReport()
  }, [reportId])

  if (loading) return <div className="text-center py-12"><p className="text-muted-foreground">Carregando resultados...</p></div>
  if (!report) return <div className="text-center py-12"><p className="text-red-600">Relatório não encontrado.</p></div>

  const tabs = [
    { key: "transformacao", label: "🔄 Transformação", data: report.brandArchetype },
    { key: "oferta", label: "💰 Oferta", data: report.brandPositioning },
    { key: "voz", label: "🗣️ Voz", data: report.brandVoice },
    { key: "visual", label: "🎨 Visual", data: report.visualIdentity },
    { key: "plano", label: "📋 Plano", data: report.brandEcosystem },
  ]

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-emerald-600 text-white shadow-md" : "bg-card border hover:bg-accent text-muted-foreground"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-card rounded-xl border p-6">
        {tabs.find(t => t.key === activeTab)?.data ? (
          <RenderData data={tabs.find(t => t.key === activeTab)!.data} />
        ) : (
          <p className="text-muted-foreground text-center py-8">Seção não disponível.</p>
        )}
      </div>
    </div>
  )
}

function RenderData({ data }: { data: any }) {
  if (!data || typeof data !== "object") return <p>-</p>
  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="border-b pb-3 last:border-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}</h3>
          {typeof value === "string" ? <p className="text-sm">{value}</p> :
           Array.isArray(value) ? (
            value.length === 0 ? <span className="text-muted-foreground text-sm">-</span> :
            typeof value[0] === "string" ? <div className="flex flex-wrap gap-2">{value.map((v, i) => <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs">{v}</span>)}</div> :
            <div className="space-y-2">{value.map((item, i) => <div key={i} className="bg-accent/50 rounded p-2 text-sm">{typeof item === "object" ? Object.entries(item).map(([k, v]) => <div key={k}><span className="font-medium text-muted-foreground text-xs">{k}:</span> {String(v)}</div>) : String(item)}</div>)}</div>
           ) : typeof value === "object" ? (
            <div className="bg-accent/30 rounded p-3 space-y-1 text-sm">{Object.entries(value as object).map(([k, v]) => <div key={k}><span className="font-medium text-muted-foreground text-xs">{k}:</span> {typeof v === "string" ? v : JSON.stringify(v)}</div>)}</div>
           ) : <p className="text-sm">{String(value)}</p>}
        </div>
      ))}
    </div>
  )
}
