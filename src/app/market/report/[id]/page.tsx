"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MarketReportPage() {
  const params = useParams()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("personas")

  useEffect(() => {
    const fetchReport = async () => {
      const res = await fetch(`/api/market-report/${params.id}`)
      if (res.ok) setReport(await res.json())
      setLoading(false)
    }
    fetchReport()
    const interval = setInterval(async () => {
      const res = await fetch(`/api/market-report/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setReport(data)
        if (data.status !== "GENERATING") clearInterval(interval)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [params.id])

  if (loading) return <Loading />
  if (!report) return <NotFound />
  if (report.status === "GENERATING") return <Generating />

  const data = report.data || {}
  const sections = [
    { key: "personas", label: "Buying Personas" },
    { key: "empathy", label: "Mapa Empatia" },
    { key: "swot", label: "SWOT" },
    { key: "tam", label: "TAM/SAM/SOM" },
    { key: "strategies", label: "Estrategias" },
    { key: "psychology", label: "Psicologia" },
    { key: "productfit", label: "Product Fit" },
    { key: "creative", label: "Brief Criativo" },
  ]

  const sectionDataMap: Record<string, any> = {
    personas: data.buyingPersonas,
    empathy: data.empathyMap,
    swot: data.swotAnalysis,
    tam: data.tamSamSom,
    strategies: data.marketingStrategies,
    psychology: data.psychologyContent,
    productfit: data.productMarketFit,
    creative: data.creativeDataBrief,
  }

  const currentData = sectionDataMap[activeSection]

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/market" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500" />
            <span className="text-xl font-bold">MarketIntel</span>
          </Link>
          <Badge variant="success">Completo</Badge>
        </div>
      </header>

      <section className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold">{report.company?.name}</h1>
          <p className="text-white/80 mt-2">
            Relatorio de Mercado & Vendas - {report.company?.industry}
          </p>
        </div>
      </section>

      <nav className="border-b sticky top-[73px] bg-white/90 backdrop-blur-lg z-40">
        <div className="container mx-auto px-6 flex overflow-x-auto gap-1 py-2">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === s.key
                  ? "bg-emerald-500 text-white"
                  : "hover:bg-accent text-muted-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {activeSection === "personas" && <PersonasView data={currentData} />}
        {activeSection === "empathy" && <EmpathyView data={currentData} />}
        {activeSection === "swot" && <SwotView data={currentData} />}
        {activeSection === "tam" && <TamView data={currentData} />}
        {activeSection === "strategies" && <GenericView title="Estrategias de Marketing" data={currentData} />}
        {activeSection === "psychology" && <GenericView title="Psicologia Aplicada" data={currentData} />}
        {activeSection === "productfit" && <GenericView title="Product-Market Fit" data={currentData} />}
        {activeSection === "creative" && <GenericView title="Brief Criativo (para SaaS 3 e 4)" data={currentData} />}
      </main>
    </div>
  )
}

function PersonasView({ data }: { data: any }) {
  if (!data) return <Empty />
  const personas = data.personas || []
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Buying Personas</h2>
      {data.priorityPersona && (
        <p className="text-muted-foreground">Persona prioritaria: <strong>{data.priorityPersona}</strong></p>
      )}
      <div className="grid gap-6">
        {personas.map((p: any, i: number) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{p.name} - {p.occupation}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div><strong>Idade:</strong> {p.age}</div>
                <div><strong>Renda:</strong> {p.income}</div>
                <div><strong>Local:</strong> {p.location}</div>
                <div><strong>Familia:</strong> {p.familyStatus}</div>
              </div>
              <div>
                <strong className="text-sm">Objetivos:</strong>
                <ul className="list-disc pl-4 text-sm">{p.goals?.map((g: string, j: number) => <li key={j}>{g}</li>)}</ul>
              </div>
              <div>
                <strong className="text-sm">Frustracoes:</strong>
                <ul className="list-disc pl-4 text-sm">{p.frustrations?.map((f: string, j: number) => <li key={j}>{f}</li>)}</ul>
              </div>
              {p.buyingBehavior && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <strong>Comportamento de Compra:</strong>
                  <p>{p.buyingBehavior.decisionProcess}</p>
                  <p className="mt-1"><strong>Gatilhos:</strong> {p.buyingBehavior.triggers?.join(", ")}</p>
                  <p><strong>Objecoes:</strong> {p.buyingBehavior.objections?.join(", ")}</p>
                </div>
              )}
              {p.messagingThatWorks && (
                <div>
                  <strong className="text-sm">Mensagens que funcionam:</strong>
                  <ul className="list-disc pl-4 text-sm">{p.messagingThatWorks.map((m: string, j: number) => <li key={j}>{m}</li>)}</ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function EmpathyView({ data }: { data: any }) {
  if (!data) return <Empty />
  const maps = data.empathyMaps || []
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Mapa da Empatia</h2>
      {maps.map((map: any, i: number) => (
        <Card key={i}>
          <CardHeader><CardTitle>{map.segment}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-700 text-sm mb-1">PENSA</h4>
                <ul className="text-sm space-y-1">{map.thinks?.map((t: string, j: number) => <li key={j}>- {t}</li>)}</ul>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-700 text-sm mb-1">SENTE</h4>
                <ul className="text-sm space-y-1">{map.feels?.map((f: string, j: number) => <li key={j}>- {f}</li>)}</ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-700 text-sm mb-1">DIZ</h4>
                <ul className="text-sm space-y-1">{map.says?.map((s: string, j: number) => <li key={j}>- {s}</li>)}</ul>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-700 text-sm mb-1">FAZ</h4>
                <ul className="text-sm space-y-1">{map.does?.map((d: string, j: number) => <li key={j}>- {d}</li>)}</ul>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-700 text-sm mb-1">DORES</h4>
                <ul className="text-sm space-y-1">{map.pains?.map((p: string, j: number) => <li key={j}>- {p}</li>)}</ul>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <h4 className="font-semibold text-emerald-700 text-sm mb-1">GANHOS</h4>
                <ul className="text-sm space-y-1">{map.gains?.map((g: string, j: number) => <li key={j}>- {g}</li>)}</ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {data.keyInsights && (
        <Card className="bg-emerald-50">
          <CardHeader><CardTitle className="text-lg">Insights Chave</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">{data.keyInsights.map((i: string, j: number) => <li key={j}>- {i}</li>)}</ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SwotView({ data }: { data: any }) {
  if (!data) return <Empty />
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Analise SWOT</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-green-200">
          <CardHeader><CardTitle className="text-green-700 text-lg">Forcas</CardTitle></CardHeader>
          <CardContent>
            {data.strengths?.map((s: any, i: number) => (
              <div key={i} className="mb-2 text-sm"><strong>{s.item}</strong><p className="text-muted-foreground">{s.leverageStrategy}</p></div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader><CardTitle className="text-red-700 text-lg">Fraquezas</CardTitle></CardHeader>
          <CardContent>
            {data.weaknesses?.map((w: any, i: number) => (
              <div key={i} className="mb-2 text-sm"><strong>{w.item}</strong><p className="text-muted-foreground">{w.mitigationStrategy}</p></div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader><CardTitle className="text-blue-700 text-lg">Oportunidades</CardTitle></CardHeader>
          <CardContent>
            {data.opportunities?.map((o: any, i: number) => (
              <div key={i} className="mb-2 text-sm"><strong>{o.item}</strong><p className="text-muted-foreground">{o.captureStrategy}</p></div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardHeader><CardTitle className="text-orange-700 text-lg">Ameacas</CardTitle></CardHeader>
          <CardContent>
            {data.threats?.map((t: any, i: number) => (
              <div key={i} className="mb-2 text-sm"><strong>{t.item}</strong><p className="text-muted-foreground">{t.counterStrategy}</p></div>
            ))}
          </CardContent>
        </Card>
      </div>
      {data.priorityActions && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Acoes Prioritarias</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">{data.priorityActions.map((a: string, i: number) => <li key={i}>{i + 1}. {a}</li>)}</ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TamView({ data }: { data: any }) {
  if (!data) return <Empty />
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">TAM / SAM / SOM</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center border-2 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">TAM (Total)</p>
            <p className="text-2xl font-bold text-blue-600">{data.tam?.value}</p>
            <p className="text-sm mt-2">{data.tam?.description}</p>
          </CardContent>
        </Card>
        <Card className="text-center border-2 border-emerald-200">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">SAM (Acessivel)</p>
            <p className="text-2xl font-bold text-emerald-600">{data.sam?.value}</p>
            <p className="text-sm mt-2">{data.sam?.description}</p>
          </CardContent>
        </Card>
        <Card className="text-center border-2 border-purple-200">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">SOM (Obtivel)</p>
            <p className="text-2xl font-bold text-purple-600">{data.som?.value}</p>
            <p className="text-sm mt-2">{data.som?.description}</p>
          </CardContent>
        </Card>
      </div>
      {data.revenueProjection && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Projecao de Receita</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-sm text-muted-foreground">Ano 1</p><p className="font-bold">{data.revenueProjection.year1}</p></div>
            <div><p className="text-sm text-muted-foreground">Ano 2</p><p className="font-bold">{data.revenueProjection.year2}</p></div>
            <div><p className="text-sm text-muted-foreground">Ano 3</p><p className="font-bold">{data.revenueProjection.year3}</p></div>
          </CardContent>
        </Card>
      )}
      {data.marketTrends && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Tendencias de Mercado</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">{data.marketTrends.map((t: string, i: number) => <li key={i}>- {t}</li>)}</ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function GenericView({ title, data }: { title: string; data: any }) {
  if (!data) return <Empty />
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">{title}</h2>
      <Card>
        <CardContent className="pt-6">
          <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-[600px]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

function Loading() {
  return <div className="min-h-screen flex items-center justify-center"><p>Carregando...</p></div>
}

function NotFound() {
  return <div className="min-h-screen flex items-center justify-center"><p>Relatorio nao encontrado</p></div>
}

function Generating() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse mx-auto flex items-center justify-center">
          <span className="text-white text-2xl">AI</span>
        </div>
        <h2 className="text-2xl font-bold">Analisando o Mercado...</h2>
        <p className="text-muted-foreground">8 frameworks sendo aplicados. Isso pode levar 2-4 minutos.</p>
      </div>
    </div>
  )
}

function Empty() {
  return <div className="text-center py-12"><p className="text-muted-foreground">Secao nao gerada.</p></div>
}
