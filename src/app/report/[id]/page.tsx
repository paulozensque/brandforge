"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ReportPage() {
  const params = useParams()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("archetype")

  useEffect(() => {
    const fetchReport = async () => {
      const res = await fetch(`/api/brand-report/${params.id}`)
      if (res.ok) setReport(await res.json())
      setLoading(false)
    }
    fetchReport()
    const interval = setInterval(async () => {
      const res = await fetch(`/api/brand-report/${params.id}`)
      if (res.ok) { const data = await res.json(); setReport(data); if (data.status !== "GENERATING") clearInterval(interval) }
    }, 3000)
    return () => clearInterval(interval)
  }, [params.id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Carregando...</p></div>
  if (!report) return <div className="min-h-screen flex items-center justify-center"><p>Relatorio nao encontrado</p></div>
  if (report.status === "GENERATING") return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full gradient-brand animate-pulse mx-auto flex items-center justify-center"><span className="text-white text-2xl">AI</span></div>
        <h2 className="text-2xl font-bold">Gerando seu Relatorio...</h2>
        <p className="text-muted-foreground">Isso pode levar de 1 a 3 minutos.</p>
      </div>
    </div>
  )

  const sections = [
    { key: "archetype", label: "Arquetipo" },
    { key: "purpose", label: "Proposito" },
    { key: "positioning", label: "Posicionamento" },
    { key: "voice", label: "Voz & Tom" },
    { key: "story", label: "Historia" },
    { key: "visual", label: "Visual" },
    { key: "competitors", label: "Concorrentes" },
    { key: "actionplan", label: "Plano de Acao" },
  ]

  const sectionDataMap: Record<string, any> = {
    archetype: report.brandArchetype,
    purpose: report.brandPurpose,
    positioning: report.brandPositioning,
    voice: report.brandVoice,
    story: report.brandStory,
    visual: report.visualIdentity,
    competitors: report.competitorAnalysis,
    actionplan: report.brandEcosystem,
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg gradient-brand" /><span className="text-xl font-bold">BrandForge</span></Link>
          <Badge variant="success">Completo</Badge>
        </div>
      </header>
      <section className="gradient-brand text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold">{report.company?.name}</h1>
          <p className="text-white/80 mt-2">Relatorio de Branding - {report.company?.industry}</p>
        </div>
      </section>
      <nav className="border-b sticky top-[73px] bg-white/90 backdrop-blur-lg z-40">
        <div className="container mx-auto px-6 flex overflow-x-auto gap-1 py-2">
          {sections.map((s) => (
            <button key={s.key} onClick={() => setActiveSection(s.key)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeSection === s.key ? "bg-primary text-white" : "hover:bg-accent text-muted-foreground"}`}>{s.label}</button>
          ))}
        </div>
      </nav>
      <main className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-2xl font-bold mb-4">{sections.find(s => s.key === activeSection)?.label}</h2>
          <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-[600px]">
            {JSON.stringify(sectionDataMap[activeSection], null, 2)}
          </pre>
        </div>
      </main>
    </div>
  )
}
