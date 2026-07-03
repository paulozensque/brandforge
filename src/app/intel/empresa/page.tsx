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
        <div className="space-y-6">
          {/* Seção 1: Dados básicos */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">1️⃣ Sua Empresa</h2>
            <p className="text-xs text-muted-foreground">Informações básicas para a IA entender seu negócio.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome da empresa *</label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ex: Zen Power" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Setor *</label>
                <select value={form.industry} onChange={(e) => update("industry", e.target.value)} className="w-full h-10 rounded-md border px-3 text-sm mt-1">
                  <option value="">Selecione...</option>
                  <option value="Marketing Digital">Marketing Digital</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="SaaS / Tecnologia">SaaS / Tecnologia</option>
                  <option value="Educação / Infoprodutos">Educação / Infoprodutos</option>
                  <option value="Saúde / Estética">Saúde / Estética</option>
                  <option value="Consultoria / Serviços">Consultoria / Serviços</option>
                  <option value="Varejo">Varejo</option>
                  <option value="Imobiliário">Imobiliário</option>
                  <option value="Alimentação">Alimentação</option>
                  <option value="Finanças">Finanças</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Tamanho da equipe</label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {["Só eu", "2-5 pessoas", "6-15 pessoas", "16-50 pessoas", "50+"].map(opt => (
                  <button key={opt} onClick={() => update("teamSize", opt)}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${form.teamSize === opt ? "border-emerald-500 bg-emerald-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Faturamento mensal</label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {["Até R$ 10k", "R$ 10-50k", "R$ 50-200k", "R$ 200k-1M", "R$ 1M+"].map(opt => (
                  <button key={opt} onClick={() => update("revenue", opt)}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${form.revenue === opt ? "border-emerald-500 bg-emerald-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Há quanto tempo existe?</label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {["Menos de 1 ano", "1-3 anos", "3-5 anos", "5-10 anos", "10+ anos"].map(opt => (
                  <button key={opt} onClick={() => update("yearsInMarket", opt)}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${form.yearsInMarket === opt ? "border-emerald-500 bg-emerald-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 2: O que vende */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">2️⃣ O que você vende?</h2>
            <p className="text-xs text-muted-foreground">Liste seus produtos/serviços e como entrega.</p>
            <div>
              <label className="text-sm font-medium">Produtos ou serviços (adicione e pressione Enter)</label>
              <TagInput value={form.mainProducts} onChange={(v) => update("mainProducts", v)} placeholder="Ex: Gestão de tráfego, Branding, Consultoria..." />
            </div>
            <div>
              <label className="text-sm font-medium">Modelo de entrega</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { value: "digital", label: "💻 100% Digital", desc: "Online" },
                  { value: "servico", label: "🤝 Serviço/Consultoria", desc: "Reuniões" },
                  { value: "fisico", label: "📦 Produto Físico", desc: "Entrega" },
                  { value: "hibrido", label: "🔄 Híbrido", desc: "Mix" },
                ].map(opt => (
                  <button key={opt.value} onClick={() => update("deliveryModel", opt.value)}
                    className={`px-3 py-3 rounded-lg border text-xs text-center transition-all ${form.deliveryModel === opt.value ? "border-emerald-500 bg-emerald-50 font-medium" : "hover:border-gray-400"}`}>
                    <span className="block text-lg mb-1">{opt.label.split(" ")[0]}</span>{opt.label.split(" ").slice(1).join(" ")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Ticket médio (valor por cliente)</label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {["Até R$ 500", "R$ 500-2k", "R$ 2k-5k", "R$ 5k-20k", "R$ 20k+"].map(opt => (
                  <button key={opt} onClick={() => update("avgTicket", opt)}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${form.avgTicket === opt ? "border-emerald-500 bg-emerald-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 3: Como se posiciona */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">3️⃣ Como você se posiciona hoje?</h2>
            <p className="text-xs text-muted-foreground">Como o mercado te enxerga atualmente.</p>
            <div>
              <label className="text-sm font-medium">Sua empresa é vista como...</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {[
                  "A mais barata do mercado", "Bom custo-benefício", "Premium/Cara",
                  "Especialista no nicho", "Generalista", "Ainda não tenho posicionamento claro"
                ].map(opt => (
                  <button key={opt} onClick={() => update("currentPositioning", opt)}
                    className={`px-3 py-2 rounded-lg border text-xs text-left transition-all ${form.currentPositioning === opt ? "border-emerald-500 bg-emerald-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">O que te diferencia? (adicione e pressione Enter)</label>
              <TagInput value={form.currentDifferentials} onChange={(v) => update("currentDifferentials", v)} placeholder="Ex: Atendimento personalizado, Resultado garantido..." />
            </div>
            <div>
              <label className="text-sm font-medium">Maiores problemas hoje</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {[
                  "Poucos clientes/leads", "Preço muito baixo", "Marca fraca/desconhecida",
                  "Não sei me diferenciar", "Dependo de indicação", "Alta concorrência",
                  "Não consigo escalar", "Cliente não percebe valor", "Outro"
                ].map(opt => (
                  <button key={opt} onClick={() => update("currentProblems", form.currentProblems === opt ? "" : opt)}
                    className={`px-3 py-2 rounded-lg border text-xs text-left transition-all ${form.currentProblems === opt ? "border-red-500 bg-red-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 4: Público */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">4️⃣ Seu cliente ideal</h2>
            <p className="text-xs text-muted-foreground">Quem é a pessoa que mais precisa do que você vende?</p>
            <div>
              <label className="text-sm font-medium">Descreva brevemente seu cliente ideal</label>
              <Input value={form.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} placeholder="Ex: Dono de e-commerce faturando R$ 50-200k/mês que quer escalar" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">O que esse cliente mais sofre? (adicione e pressione Enter)</label>
              <TagInput value={form.audiencePains} onChange={(v) => update("audiencePains", v)} placeholder="Ex: Não consegue vender, Gasta muito em ads..." />
            </div>
            <div>
              <label className="text-sm font-medium">O que ele mais deseja? (adicione e pressione Enter)</label>
              <TagInput value={form.audienceDesires} onChange={(v) => update("audienceDesires", v)} placeholder="Ex: Faturar 2x mais, Ter previsibilidade..." />
            </div>
          </section>

          {/* Seção 5: Personalidade */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">5️⃣ Personalidade da marca</h2>
            <p className="text-xs text-muted-foreground">Como você quer ser percebido?</p>
            <div>
              <label className="text-sm font-medium">Tom de voz (selecione até 3)</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                {["Profissional", "Ousado", "Amigável", "Premium", "Educativo", "Direto", "Inspirador", "Técnico", "Descontraído", "Autoritário", "Empático", "Provocativo"].map(opt => (
                  <button key={opt} onClick={() => {
                    const current = form.brandTone || []
                    const updated = current.includes(opt) ? current.filter((c: string) => c !== opt) : current.length < 3 ? [...current, opt] : current
                    update("brandTone", updated)
                  }}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${(form.brandTone || []).includes(opt) ? "border-purple-500 bg-purple-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Valores da marca (selecione até 4)</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                {["Inovação", "Transparência", "Resultado", "Qualidade", "Velocidade", "Confiança", "Exclusividade", "Simplicidade", "Liberdade", "Comunidade", "Crescimento", "Impacto"].map(opt => (
                  <button key={opt} onClick={() => {
                    const current = form.brandValues || []
                    const updated = current.includes(opt) ? current.filter((c: string) => c !== opt) : current.length < 4 ? [...current, opt] : current
                    update("brandValues", updated)
                  }}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${(form.brandValues || []).includes(opt) ? "border-emerald-500 bg-emerald-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Marcas que te inspiram (adicione e pressione Enter)</label>
              <TagInput value={form.inspirations} onChange={(v) => update("inspirations", v)} placeholder="Ex: Apple, Nike, King Kong Agency..." />
            </div>
          </section>

          {/* Seção 6: Objetivos */}
          <section className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">6️⃣ Onde quer chegar?</h2>
            <p className="text-xs text-muted-foreground">Seus objetivos principais.</p>
            <div>
              <label className="text-sm font-medium">Principal objetivo agora</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {[
                  "🚀 Crescer faturamento", "🎯 Reposicionar marca", "📈 Mais leads/clientes",
                  "💰 Aumentar ticket médio", "🌐 Presença digital", "📊 Escalar operação"
                ].map(opt => (
                  <button key={opt} onClick={() => update("goals", opt)}
                    className={`px-3 py-2 rounded-lg border text-xs text-left transition-all ${form.goals === opt ? "border-emerald-500 bg-emerald-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Em quanto tempo?</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {["3 meses", "6 meses", "1 ano", "Sem pressa"].map(opt => (
                  <button key={opt} onClick={() => update("timeline", opt)}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${form.timeline === opt ? "border-emerald-500 bg-emerald-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Budget mensal para marketing</label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {["Até R$ 1k", "R$ 1-5k", "R$ 5-15k", "R$ 15-50k", "R$ 50k+"].map(opt => (
                  <button key={opt} onClick={() => update("monthlyBudget", opt)}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${form.monthlyBudget === opt ? "border-emerald-500 bg-emerald-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </div>
          </section>

          <Button onClick={handleSubmit} disabled={loading || !form.name || !form.industry} size="lg" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
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
