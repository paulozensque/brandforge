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
        <div className="space-y-6">
          {/* Seção 1: Sobre você */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">1️⃣ Sobre sua empresa</h2>
            <p className="text-xs text-muted-foreground">Informações básicas para contextualizar a análise.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome da empresa *</label>
                <Input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="Ex: Zen Power" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Setor de atuação *</label>
                <select value={form.industry} onChange={(e) => update("industry", e.target.value)} className="w-full h-10 rounded-md border px-3 text-sm mt-1">
                  <option value="">Selecione...</option>
                  <option value="Marketing Digital">Marketing Digital</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="SaaS / Tecnologia">SaaS / Tecnologia</option>
                  <option value="Educação / Infoprodutos">Educação / Infoprodutos</option>
                  <option value="Saúde / Estética">Saúde / Estética</option>
                  <option value="Consultoria / Serviços">Consultoria / Serviços</option>
                  <option value="Varejo / Produtos Físicos">Varejo / Produtos Físicos</option>
                  <option value="Imobiliário">Imobiliário</option>
                  <option value="Alimentação / Restaurantes">Alimentação / Restaurantes</option>
                  <option value="Finanças / Investimentos">Finanças / Investimentos</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Qual é o seu nicho específico? *</label>
              <p className="text-xs text-muted-foreground">Seja o mais específico possível. Ex: "Agências de tráfego pago que atendem clínicas de estética em SP"</p>
              <Input value={form.niche} onChange={(e) => update("niche", e.target.value)} placeholder="Descreva seu nicho com detalhes..." className="mt-1" />
            </div>
          </section>

          {/* Seção 2: Mercado */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">2️⃣ Sobre o mercado</h2>
            <p className="text-xs text-muted-foreground">Não precisa ser exato — uma estimativa já ajuda a IA gerar insights melhores.</p>
            <div>
              <label className="text-sm font-medium">Qual o tamanho estimado desse mercado?</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {["Até R$ 1 milhão/ano", "R$ 1-10 milhões", "R$ 10-100 milhões", "R$ 100 milhões+", "Não sei estimar"].map(opt => (
                  <button key={opt} onClick={() => update("marketSize", opt)}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${form.marketSize === opt ? "border-blue-500 bg-blue-50 font-medium" : "hover:border-gray-400"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">O mercado está em qual momento?</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {[
                  { value: "Crescendo rápido", icon: "🚀" },
                  { value: "Crescendo devagar", icon: "📈" },
                  { value: "Estável/Maduro", icon: "⚖️" },
                  { value: "Saturado/Difícil", icon: "😰" },
                ].map(opt => (
                  <button key={opt.value} onClick={() => update("currentTrends", opt.value)}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${form.currentTrends === opt.value ? "border-blue-500 bg-blue-50 font-medium" : "hover:border-gray-400"}`}>
                    {opt.icon} {opt.value}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Faixa de preço praticada no mercado</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {["Até R$ 500", "R$ 500 - R$ 2.000", "R$ 2.000 - R$ 10.000", "R$ 10.000+", "Varia muito"].map(opt => (
                  <button key={opt} onClick={() => update("priceRange", opt)}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${form.priceRange === opt ? "border-blue-500 bg-blue-50 font-medium" : "hover:border-gray-400"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 3: Concorrentes */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">3️⃣ Concorrentes</h2>
            <p className="text-xs text-muted-foreground">Liste quem compete com você (direto ou indireto). Se não souber, tudo bem — a IA busca por você.</p>
            <div>
              <label className="text-sm font-medium">Nomes de concorrentes (adicione e pressione Enter)</label>
              <TagInput value={form.competitors} onChange={(v) => update("competitors", v)} placeholder="Ex: Empresa X, Empresa Y..." />
            </div>
          </section>

          {/* Seção 4: Público */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">4️⃣ Quem é seu público?</h2>
            <p className="text-xs text-muted-foreground">Descreva quem compra no seu mercado.</p>
            <div>
              <label className="text-sm font-medium">Tipo de cliente</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {[
                  { value: "Empresas pequenas (B2B)", icon: "🏢" },
                  { value: "Empresas médias/grandes (B2B)", icon: "🏛️" },
                  { value: "Consumidor final (B2C)", icon: "👤" },
                  { value: "Profissionais liberais", icon: "💼" },
                  { value: "E-commerces", icon: "🛒" },
                  { value: "Misto (B2B + B2C)", icon: "🔄" },
                ].map(opt => (
                  <button key={opt.value} onClick={() => update("audienceProfile", opt.value)}
                    className={`px-3 py-2 rounded-lg border text-xs text-left transition-all ${form.audienceProfile === opt.value ? "border-blue-500 bg-blue-50 font-medium" : "hover:border-gray-400"}`}>
                    {opt.icon} {opt.value}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Principais dores do seu público (adicione e pressione Enter)</label>
              <TagInput value={form.audiencePains} onChange={(v) => update("audiencePains", v)} placeholder="Ex: Não conseguem vender online, Falta de leads..." />
            </div>
            <div>
              <label className="text-sm font-medium">Onde seu público está? (selecione todos que se aplicam)</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                {["Instagram", "Google", "YouTube", "TikTok", "LinkedIn", "WhatsApp", "Facebook", "Email", "Eventos", "Indicação"].map(opt => (
                  <button key={opt} onClick={() => {
                    const current = form.channels || []
                    const updated = current.includes(opt) ? current.filter((c: string) => c !== opt) : [...current, opt]
                    update("channels", updated)
                  }}
                    className={`px-2 py-2 rounded-lg border text-xs transition-all ${(form.channels || []).includes(opt) ? "border-blue-500 bg-blue-50 font-medium" : "hover:border-gray-400"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 5: Visão */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">5️⃣ Sua visão do mercado</h2>
            <p className="text-xs text-muted-foreground">Opcional — qualquer informação extra ajuda a IA.</p>
            <div>
              <label className="text-sm font-medium">O que ameaça esse mercado?</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {["IA substituindo", "Muita concorrência", "Preço caindo", "Regulação/Leis", "Mudança de comportamento", "Nenhuma grande"].map(opt => (
                  <button key={opt} onClick={() => update("threats", opt)}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${form.threats === opt ? "border-red-500 bg-red-50 font-medium" : "hover:border-gray-400"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Oportunidades que você enxerga</label>
              <Textarea value={form.opportunities} onChange={(e) => update("opportunities", e.target.value)} placeholder="Ex: Poucos players atendem bem o nicho X, mercado está migrando para Y..." rows={2} className="mt-1" />
            </div>
          </section>

          <Button onClick={handleSubmit} disabled={loading || !form.companyName || !form.industry || !form.niche} size="lg" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
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

  if (loading) return <div className="text-center py-12"><div className="w-12 h-12 rounded-full bg-blue-100 animate-pulse mx-auto mb-3" /><p className="text-muted-foreground">Gerando análise com IA...</p></div>
  if (!report) return <div className="text-center py-12"><p className="text-red-600">Não encontrado</p></div>

  const data = report.data || {}
  const tabs = [
    { key: "marketOverview", label: "📊 TAM/SAM/SOM" },
    { key: "swot", label: "🎯 SWOT" },
    { key: "competitorAnalysis", label: "⚔️ Concorrentes" },
    { key: "porter", label: "🏗️ 5 Forças" },
    { key: "bcgMatrix", label: "📦 BCG" },
    { key: "ansoff", label: "📈 Ansoff" },
    { key: "valueChain", label: "🔗 Cadeia Valor" },
    { key: "customerJourney", label: "🗺️ Jornada" },
    { key: "positioning", label: "🎯 Posicionamento" },
    { key: "opportunities", label: "🚀 Oportunidades" },
  ]

  const handleDownloadPDF = () => {
    const content = JSON.stringify(data, null, 2)
    const blob = new Blob([`RELATÓRIO DE ANÁLISE DE MERCADO\n${"=".repeat(50)}\n\n${formatDataForPDF(data)}`], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analise-mercado-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
  }

  const handleExportCode = () => {
    const code = {
      _type: "eco_strategic_code",
      _version: "1.0",
      _generated: new Date().toISOString(),
      market: data.marketOverview || {},
      swot: data.swot || {},
      competitors: data.competitorAnalysis || {},
      opportunities: data.opportunities || {},
      positioning: data.positioning || {},
      customerJourney: data.customerJourney || {},
    }
    const blob = new Blob([JSON.stringify(code, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `eco-strategic-code-${new Date().toISOString().split("T")[0]}.json`
    a.click()
  }

  return (
    <div>
      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant="outline" onClick={handleDownloadPDF}>📄 Baixar Relatório</Button>
        <Button size="sm" variant="outline" onClick={handleExportCode}>📦 Exportar Código Estratégico</Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === tab.key ? "bg-blue-600 text-white" : "bg-card border hover:bg-accent"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAM/SAM/SOM Visual */}
      {activeTab === "marketOverview" && data.marketOverview && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border p-6">
            <h3 className="font-semibold text-lg mb-4">📊 Tamanho do Mercado (TAM / SAM / SOM)</h3>
            <div className="flex items-center justify-center gap-4 py-6">
              <div className="relative">
                <div className="w-48 h-48 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full bg-blue-200 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs text-center">SOM<br/>{data.marketOverview.tamanhoMercado?.som || "?"}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-0 text-xs text-blue-600 font-medium">TAM: {data.marketOverview.tamanhoMercado?.tam || "?"}</div>
                <div className="absolute top-14 -right-4 text-xs text-blue-500 font-medium">SAM: {data.marketOverview.tamanhoMercado?.sam || "?"}</div>
              </div>
              <div className="space-y-2 text-sm max-w-xs">
                <div><span className="inline-block w-3 h-3 rounded-full bg-blue-100 mr-2" /><strong>TAM:</strong> {data.marketOverview.tamanhoMercado?.explicacao_tam || "Mercado total"}</div>
                <div><span className="inline-block w-3 h-3 rounded-full bg-blue-200 mr-2" /><strong>SAM:</strong> {data.marketOverview.tamanhoMercado?.explicacao_sam || "Mercado endereçável"}</div>
                <div><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2" /><strong>SOM:</strong> {data.marketOverview.tamanhoMercado?.explicacao_som || "Mercado obtível"}</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Crescimento Anual</h4>
              <p className="text-2xl font-bold text-emerald-600">{data.marketOverview.crescimentoAnual || "N/A"}</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Ciclo de Vida</h4>
              <p className="text-2xl font-bold text-blue-600">{data.marketOverview.cicloDeVida || "N/A"}</p>
            </div>
          </div>
          {data.marketOverview.tendencias && (
            <div className="bg-card rounded-xl border p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">🔥 Tendências</h4>
              <div className="flex flex-wrap gap-2">{data.marketOverview.tendencias.map((t: string, i: number) => <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">{t}</span>)}</div>
            </div>
          )}
          <RenderSection data={{ barreirasEntrada: data.marketOverview.barreirasEntrada, fatoresChave: data.marketOverview.fatoresChave, perspectiva5Anos: data.marketOverview.perspectiva5Anos }} />
        </div>
      )}

      {/* SWOT Visual */}
      {activeTab === "swot" && data.swot && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <h3 className="font-bold text-emerald-800 mb-3">💪 Forças</h3>
              <div className="space-y-2">{(data.swot.forcas || []).map((f: any, i: number) => (
                <div key={i} className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${f.impacto === "alto" ? "bg-emerald-600" : "bg-emerald-300"}`} /><span className="text-sm">{f.item || f}</span></div>
              ))}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-800 mb-3">⚠️ Fraquezas</h3>
              <div className="space-y-2">{(data.swot.fraquezas || []).map((f: any, i: number) => (
                <div key={i} className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${f.impacto === "alto" ? "bg-red-600" : "bg-red-300"}`} /><span className="text-sm">{f.item || f}</span></div>
              ))}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-bold text-blue-800 mb-3">🚀 Oportunidades</h3>
              <div className="space-y-2">{(data.swot.oportunidades || []).map((f: any, i: number) => (
                <div key={i} className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${f.impacto === "alto" ? "bg-blue-600" : "bg-blue-300"}`} /><span className="text-sm">{f.item || f}</span></div>
              ))}</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-bold text-amber-800 mb-3">⚡ Ameaças</h3>
              <div className="space-y-2">{(data.swot.ameacas || []).map((f: any, i: number) => (
                <div key={i} className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${f.impacto === "alto" ? "bg-amber-600" : "bg-amber-300"}`} /><span className="text-sm">{f.item || f}</span></div>
              ))}</div>
            </div>
          </div>
          {data.swot.estrategias_fo && (
            <div className="bg-card rounded-xl border p-4">
              <h4 className="text-sm font-medium mb-2">🎯 Estratégias (Forças × Oportunidades)</h4>
              <div className="space-y-1">{data.swot.estrategias_fo.map((e: string, i: number) => <p key={i} className="text-sm">→ {e}</p>)}</div>
            </div>
          )}
        </div>
      )}

      {/* Porter's 5 Forces Visual */}
      {activeTab === "porter" && data.porter && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border p-6">
            <h3 className="font-semibold text-lg mb-4">🏗️ 5 Forças de Porter</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { key: "rivalidade_entre_concorrentes", label: "Rivalidade", icon: "⚔️", color: "red" },
                { key: "poder_fornecedores", label: "Fornecedores", icon: "🏭", color: "amber" },
                { key: "poder_compradores", label: "Compradores", icon: "👥", color: "blue" },
                { key: "ameaca_substitutos", label: "Substitutos", icon: "🔄", color: "purple" },
                { key: "ameaca_novos_entrantes", label: "Novos Entrantes", icon: "🚪", color: "orange" },
              ].map(force => {
                const forceData = data.porter[force.key]
                const intensity = forceData?.intensidade || 5
                return (
                  <div key={force.key} className="text-center bg-accent/50 rounded-xl p-4">
                    <span className="text-2xl block mb-1">{force.icon}</span>
                    <p className="text-xs font-medium mb-2">{force.label}</p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                      <div className={`h-3 rounded-full ${intensity >= 7 ? "bg-red-500" : intensity >= 4 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${intensity * 10}%` }} />
                    </div>
                    <p className="text-lg font-bold">{intensity}/10</p>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Atratividade Geral do Mercado:</p>
              <p className="text-3xl font-bold text-blue-600">{data.porter.atratividade_geral || "?"}/10</p>
            </div>
          </div>
          {data.porter.recomendacao && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-sm text-blue-800 mb-1">💡 Recomendação</h4>
              <p className="text-sm">{data.porter.recomendacao}</p>
            </div>
          )}
        </div>
      )}

      {/* Competitors & Opportunities - generic render */}
      {activeTab === "competitorAnalysis" && data.competitorAnalysis && (
        <div className="bg-card rounded-xl border p-6">
          <RenderSection data={data.competitorAnalysis} />
        </div>
      )}
      {activeTab === "opportunities" && data.opportunities && (
        <div className="bg-card rounded-xl border p-6">
          <RenderSection data={data.opportunities} />
        </div>
      )}

      {/* BCG Matrix */}
      {activeTab === "bcgMatrix" && data.bcgMatrix && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <h3 className="font-bold text-yellow-800 mb-2">⭐ Estrelas</h3>
              <p className="text-xs text-muted-foreground mb-2">Alto crescimento + Alta participação</p>
              {(data.bcgMatrix.estrelas || []).map((i: any, idx: number) => <div key={idx} className="text-sm mb-1">• {i.produto} → {i.acao}</div>)}
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h3 className="font-bold text-green-800 mb-2">🐄 Vacas Leiteiras</h3>
              <p className="text-xs text-muted-foreground mb-2">Baixo crescimento + Alta participação</p>
              {(data.bcgMatrix.vacas_leiteiras || []).map((i: any, idx: number) => <div key={idx} className="text-sm mb-1">• {i.produto} → {i.acao}</div>)}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-bold text-blue-800 mb-2">❓ Interrogações</h3>
              <p className="text-xs text-muted-foreground mb-2">Alto crescimento + Baixa participação</p>
              {(data.bcgMatrix.interrogacoes || []).map((i: any, idx: number) => <div key={idx} className="text-sm mb-1">• {i.produto} → {i.acao}</div>)}
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-800 mb-2">🐕 Abacaxis</h3>
              <p className="text-xs text-muted-foreground mb-2">Baixo crescimento + Baixa participação</p>
              {(data.bcgMatrix.abacaxis || []).map((i: any, idx: number) => <div key={idx} className="text-sm mb-1">• {i.produto} → {i.acao}</div>)}
            </div>
          </div>
          {data.bcgMatrix.recomendacao_portfolio && <div className="bg-card rounded-xl border p-4"><p className="text-sm">💡 {data.bcgMatrix.recomendacao_portfolio}</p></div>}
        </div>
      )}

      {/* Ansoff */}
      {activeTab === "ansoff" && data.ansoff && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "penetracao_mercado", label: "Penetração", icon: "🎯", color: "emerald" },
              { key: "desenvolvimento_produto", label: "Novo Produto", icon: "🆕", color: "blue" },
              { key: "desenvolvimento_mercado", label: "Novo Mercado", icon: "🌍", color: "purple" },
              { key: "diversificacao", label: "Diversificação", icon: "🔀", color: "orange" },
            ].map(q => {
              const d = data.ansoff[q.key]
              return (
                <div key={q.key} className={`bg-${q.color}-50 border border-${q.color}-200 rounded-xl p-5`}>
                  <h3 className="font-bold text-sm mb-1">{q.icon} {q.label}</h3>
                  <p className="text-xs mb-2">{d?.estrategia}</p>
                  <p className="text-xs text-muted-foreground">Risco: {d?.risco} | ROI: {d?.roi_estimado}</p>
                </div>
              )
            })}
          </div>
          {data.ansoff.estrategia_recomendada && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"><p className="text-sm font-medium">✅ Recomendada: {data.ansoff.estrategia_recomendada}</p><p className="text-xs mt-1">{data.ansoff.justificativa}</p></div>}
        </div>
      )}

      {/* Value Chain, Customer Journey, Positioning - generic */}
      {activeTab === "valueChain" && data.valueChain && (
        <div className="bg-card rounded-xl border p-6"><RenderSection data={data.valueChain} /></div>
      )}
      {activeTab === "customerJourney" && data.customerJourney && (
        <div className="bg-card rounded-xl border p-6"><RenderSection data={data.customerJourney} /></div>
      )}
      {activeTab === "positioning" && data.positioning && (
        <div className="bg-card rounded-xl border p-6"><RenderSection data={data.positioning} /></div>
      )}
    </div>
  )
}

function formatDataForPDF(data: any): string {
  let text = ""
  for (const [section, content] of Object.entries(data)) {
    text += `\n${"=".repeat(40)}\n${section.toUpperCase().replace(/([A-Z])/g, " $1")}\n${"=".repeat(40)}\n\n`
    text += JSON.stringify(content, null, 2).replace(/[{}\[\]"]/g, "").replace(/,\n/g, "\n") + "\n"
  }
  return text
}

function RenderSection({ data }: { data: any }) {
  if (!data || typeof data !== "object") return <p className="text-muted-foreground">-</p>
  return (
    <div className="space-y-4">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="border-b pb-3 last:border-0">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">{k.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}</h3>
          {typeof v === "string" ? <p className="text-sm">{v}</p> :
           Array.isArray(v) ? (
            v.length === 0 ? <span className="text-sm text-muted-foreground">-</span> :
            typeof v[0] === "string" ? <div className="flex flex-wrap gap-2">{v.map((item, i) => <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{item}</span>)}</div> :
            <div className="space-y-2">{v.map((item, i) => <div key={i} className="bg-accent/50 rounded p-2 text-sm">{typeof item === "object" ? Object.entries(item).map(([ik,iv]) => <span key={ik} className="mr-3"><strong>{ik}:</strong> {String(iv)}</span>) : String(item)}</div>)}</div>
           ) : typeof v === "object" ? (
            <div className="bg-accent/30 rounded p-3 text-sm space-y-1">{Object.entries(v as object).map(([ik,iv]) => <div key={ik}><strong>{ik}:</strong> {typeof iv === "string" ? iv : JSON.stringify(iv)}</div>)}</div>
           ) : <p className="text-sm">{String(v)}</p>}
        </div>
      ))}
    </div>
  )
}
