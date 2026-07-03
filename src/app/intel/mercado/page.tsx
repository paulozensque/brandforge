"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/forms/tag-input"

const STORAGE_KEY = "eco-intel-mercado-form"
const RESULT_KEY = "eco-intel-mercado-result"

export default function AnaliseMercadoPage() {
  const [loading, setLoading] = useState(false)
  const [reportId, setReportId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(true)
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    niche: "",
    competitors: [] as string[],
    targetMarket: "",
    marketSize: "",
    currentTrends: "",
    audienceProfile: "",
    audiencePains: [] as string[],
    audienceBehavior: "",
    priceRange: "",
    channels: [] as string[],
    seasonality: "",
    threats: "",
    opportunities: "",
  })

  const update = (field: string, value: any) => {
    setForm((f) => {
      const updated = { ...f, [field]: value }
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setForm(JSON.parse(saved))
      const savedResult = localStorage.getItem(RESULT_KEY)
      if (savedResult) { setReportId(JSON.parse(savedResult).reportId); setShowForm(false) }
    }
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/intel/mercado/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setReportId(data.reportId)
      setShowForm(false)
      localStorage.setItem(RESULT_KEY, JSON.stringify({ reportId: data.reportId }))
    } catch {
      alert("Erro ao gerar análise de mercado.")
    } finally {
      setLoading(false)
    }
  }

  const handleNewAnalysis = () => { setShowForm(true); setReportId(null); localStorage.removeItem(RESULT_KEY) }

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Análise de Mercado</h1>
            <p className="text-muted-foreground mt-1">
              Mapeie seu mercado, concorrentes e oportunidades com análise estratégica baseada em dados.
            </p>
          </div>
          {!showForm && reportId && (
            <Button variant="outline" onClick={handleNewAnalysis}>+ Nova Análise</Button>
          )}
        </div>

        {!showForm && reportId && <MercadoResults reportId={reportId} />}

        {showForm && (
        <div className="space-y-8">
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">📊 Mercado & Nicho</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Sua empresa *</label>
                <Input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="Nome da empresa" />
              </div>
              <div>
                <label className="text-sm font-medium">Indústria *</label>
                <Input value={form.industry} onChange={(e) => update("industry", e.target.value)} placeholder="Ex: Marketing Digital" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Nicho específico *</label>
              <Input value={form.niche} onChange={(e) => update("niche", e.target.value)} placeholder="Ex: Agências de tráfego pago para e-commerce" />
            </div>
            <div>
              <label className="text-sm font-medium">Tamanho estimado do mercado</label>
              <Input value={form.marketSize} onChange={(e) => update("marketSize", e.target.value)} placeholder="Ex: R$ 5 bilhões/ano no Brasil" />
            </div>
            <div>
              <label className="text-sm font-medium">Tendências atuais</label>
              <Textarea value={form.currentTrends} onChange={(e) => update("currentTrends", e.target.value)} placeholder="O que está em alta no seu mercado?" />
            </div>
          </section>

          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">⚔️ Concorrentes</h2>
            <div>
              <label className="text-sm font-medium">Principais concorrentes</label>
              <TagInput value={form.competitors} onChange={(v) => update("competitors", v)} placeholder="Nome dos concorrentes diretos e indiretos" />
            </div>
            <div>
              <label className="text-sm font-medium">Faixa de preço do mercado</label>
              <Input value={form.priceRange} onChange={(e) => update("priceRange", e.target.value)} placeholder="Ex: R$ 1.000 a R$ 20.000" />
            </div>
          </section>

          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">👥 Público & Canais</h2>
            <div>
              <label className="text-sm font-medium">Perfil do público no mercado</label>
              <Textarea value={form.audienceProfile} onChange={(e) => update("audienceProfile", e.target.value)} placeholder="Quem compra neste mercado? (demografia, comportamento)" />
            </div>
            <div>
              <label className="text-sm font-medium">Dores do mercado</label>
              <TagInput value={form.audiencePains} onChange={(v) => update("audiencePains", v)} placeholder="Problemas que o mercado não resolve bem" />
            </div>
            <div>
              <label className="text-sm font-medium">Comportamento de compra</label>
              <Textarea value={form.audienceBehavior} onChange={(e) => update("audienceBehavior", e.target.value)} placeholder="Como o público pesquisa e decide comprar?" />
            </div>
            <div>
              <label className="text-sm font-medium">Canais principais</label>
              <TagInput value={form.channels} onChange={(v) => update("channels", v)} placeholder="Ex: Instagram, Google, YouTube, TikTok..." />
            </div>
          </section>

          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">🔮 Ameaças & Oportunidades</h2>
            <div>
              <label className="text-sm font-medium">Ameaças ao mercado</label>
              <Textarea value={form.threats} onChange={(e) => update("threats", e.target.value)} placeholder="O que pode prejudicar o mercado? (regulação, IA, concorrência...)" />
            </div>
            <div>
              <label className="text-sm font-medium">Oportunidades</label>
              <Textarea value={form.opportunities} onChange={(e) => update("opportunities", e.target.value)} placeholder="Gaps e oportunidades que você enxerga" />
            </div>
          </section>

          <Button onClick={handleSubmit} disabled={loading || !form.companyName || !form.industry || !form.niche} size="lg" className="w-full gradient-brand text-white">
            {loading ? "🧠 Analisando mercado com IA..." : "📊 Gerar Análise de Mercado Completa"}
          </Button>
        </div>
        )}
      </div>
    </AppShell>
  )
}

function MercadoResults({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("marketOverview")

  useEffect(() => {
    fetch(`/api/intel/mercado/${reportId}`).then(r => r.json()).then(setReport).finally(() => setLoading(false))
  }, [reportId])

  if (loading) return <div className="text-center py-12"><p>Carregando...</p></div>
  if (!report) return <div className="text-center py-12"><p className="text-red-600">Não encontrado</p></div>

  const data = report.data || {}
  const tabs = [
    { key: "marketOverview", label: "📊 Visão Geral" },
    { key: "competitorAnalysis", label: "⚔️ Concorrentes" },
    { key: "audienceInsights", label: "👥 Público" },
    { key: "opportunities", label: "🚀 Oportunidades" },
  ]

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === tab.key ? "bg-blue-600 text-white" : "bg-card border hover:bg-accent"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-card rounded-xl border p-6">
        {data[activeTab] ? (
          <div className="space-y-4">
            {Object.entries(data[activeTab]).map(([k, v]) => (
              <div key={k} className="border-b pb-3 last:border-0">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">{k.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}</h3>
                {typeof v === "string" ? <p className="text-sm">{v}</p> :
                 Array.isArray(v) ? <div className="space-y-1">{(v as any[]).map((item, i) => <div key={i} className="bg-accent/50 rounded p-2 text-sm">{typeof item === "object" ? Object.entries(item).map(([ik,iv]) => <span key={ik} className="mr-2"><strong>{ik}:</strong> {String(iv)}</span>) : String(item)}</div>)}</div> :
                 typeof v === "object" ? <div className="bg-accent/30 rounded p-3 text-sm">{Object.entries(v as object).map(([ik,iv]) => <div key={ik}><strong>{ik}:</strong> {String(iv)}</div>)}</div> :
                 <p className="text-sm">{String(v)}</p>}
              </div>
            ))}
          </div>
        ) : <p className="text-muted-foreground text-center py-8">Seção em processamento...</p>}
      </div>
    </div>
  )
}
