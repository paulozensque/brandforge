"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ReportSummary { id: string; status: string; createdAt: string; company: { name: string; industry: string } }

export default function DashboardPage() {
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/brand-report/list").then(res => res.json()).then(data => setReports(data.reports || [])).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg gradient-brand" /><span className="text-xl font-bold">BrandForge</span></Link>
          <Link href="/intake"><Button>+ Nova Marca</Button></Link>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        {loading ? <p>Carregando...</p> : reports.length === 0 ? (
          <Card className="text-center py-12"><CardContent><h3 className="text-lg font-semibold mb-2">Nenhum relatorio</h3><Link href="/intake"><Button>Criar Primeiro Relatorio</Button></Link></CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Link key={report.id} href={`/report/${report.id}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader><CardTitle className="text-lg">{report.company.name}</CardTitle><CardDescription>{report.company.industry}</CardDescription></CardHeader>
                  <CardContent><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{new Date(report.createdAt).toLocaleDateString("pt-BR")}</span><Badge variant={report.status === "COMPLETED" ? "success" : "warning"}>{report.status === "COMPLETED" ? "Pronto" : "Gerando..."}</Badge></div></CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
