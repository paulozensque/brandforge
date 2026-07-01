"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"

export default function MarketReportPage() {
  const params = useParams()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("marketOverview")

  useEffect(() => {
    const fetchReport = async () => {
      const res = await fetch(`/api/intel/mercado/${params.id}`)
      if (res.ok) setReport(await res.json())
      setLoading(false)
    }
    fetchReport()
    const interval = setInterval(async () => {
      const res = await fetch(`/api/intel/mercado/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setReport(data)
        if (data.status !== "GENERATING") clearInterval(interval)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [params.id])

  if (loading) return <AppShell><div className="flex items-center justify-center h-screen"><p>Carregando...</p></div></AppShell>
  if (!report) return <AppShell><div className="flex items-center justify-center h-screen"><p>Relatório não encontrado</p></div></AppShell>

  if (report.status === "GENERATING") {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-blue-500 animate-pulse mx-auto flex items-center justify-center">
              <span className="text-white text-2xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold">Analisando o mercado...</h2>
            <p className="text-muted-foreground">Mapeando concorrentes, público e oportunidades. 1-3 minutos.</p>
          </div>
        </div>
      </AppShell>
    )
  }

  const data = report.data || {}
  const tabs = [
    { key: "marketOverview", label: "📊 Visão Geral" },
    { key: "competitorAnalysis", label: "⚔️ Concorrentes" },
    { key: "audienceInsights", label: "👥 Público" },
    { key: "opportunities", label: "🚀 Oportunidades" },
  ]

  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{report.company?.name}</h1>
            <p className="text-muted-foreground">{report.company?.industry} • {report.company?.segment} • Análise de Mercado</p>
          </div>
          <Badge variant="success">Completo</Badge>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-card border hover:bg-accent text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-card rounded-xl border p-6">
          {data[activeTab] ? (
            <RenderData data={data[activeTab]} />
          ) : (
            <p className="text-muted-foreground">Seção em processamento...</p>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function RenderData({ data }: { data: any }) {
  if (!data || typeof data !== "object") return <p>-</p>

  return (
    <div className="space-y-6">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="border-b pb-4 last:border-0">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
          </h3>
          <RenderValue value={value} />
        </div>
      ))}
    </div>
  )
}

function RenderValue({ value }: { value: any }) {
  if (value === null || value === undefined) return <span className="text-muted-foreground">-</span>
  if (typeof value === "string") return <p>{value}</p>
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground">-</span>
    if (typeof value[0] === "string") {
      return <div className="flex flex-wrap gap-2">{value.map((v, i) => <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{v}</span>)}</div>
    }
    return (
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="bg-accent/50 rounded-lg p-3 text-sm">
            {typeof item === "object" ? Object.entries(item).map(([k, v]) => (
              <div key={k} className="flex gap-2"><span className="font-medium min-w-[140px] text-muted-foreground">{k}:</span><span>{String(v)}</span></div>
            )) : <p>{String(item)}</p>}
          </div>
        ))}
      </div>
    )
  }
  if (typeof value === "object") {
    return (
      <div className="bg-accent/30 rounded-lg p-4 space-y-2">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}><span className="text-xs font-semibold uppercase text-muted-foreground">{k.replace(/_/g, " ")}</span><RenderValue value={v} /></div>
        ))}
      </div>
    )
  }
  return <p>{String(value)}</p>
}
