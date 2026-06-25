"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CompanySummary {
  id: string
  name: string
  industry: string
  brandReports: Array<{ id: string; status: string }>
  marketReports: Array<{ id: string; status: string; createdAt: string }>
}

export default function MarketPage() {
  const [companies, setCompanies] = useState<CompanySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data.companies || []))
      .finally(() => setLoading(false))
  }, [])

  const handleGenerate = async (companyId: string) => {
    setGenerating(companyId)
    try {
      const res = await fetch("/api/market-report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      })
      if (res.ok) {
        const data = await res.json()
        window.location.href = `/market/report/${data.reportId}`
      } else {
        alert("Erro ao gerar relatorio de mercado")
      }
    } catch {
      alert("Erro de conexao")
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500" />
            <span className="text-xl font-bold">MarketIntel</span>
            <Badge variant="secondary">SaaS 2</Badge>
          </Link>
          <Link href="/dashboard"><Button variant="outline">Dashboard</Button></Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Inteligencia de Mercado</h1>
          <p className="text-muted-foreground mt-1">
            Gere analises de mercado completas usando os dados da sua marca (SaaS 1)
          </p>
        </div>

        {/* What's included */}
        <div className="grid md:grid-cols-4 gap-3 mb-12">
          {marketTools.map((tool, i) => (
            <Card key={i} className="text-center">
              <CardContent className="pt-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold">
                  {tool.icon}
                </div>
                <p className="text-xs font-medium">{tool.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Companies with brand report */}
        <h2 className="text-xl font-semibold mb-4">Selecione uma empresa para analisar:</h2>

        {loading ? (
          <p>Carregando...</p>
        ) : companies.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Nenhuma empresa cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Primeiro, crie um relatorio de branding no SaaS 1
              </p>
              <Link href="/intake"><Button>Ir para Branding (SaaS 1)</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => {
              const hasBrandReport = company.brandReports?.some((r) => r.status === "COMPLETED")
              const latestMarket = company.marketReports?.[0]

              return (
                <Card key={company.id} className="hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription>{company.industry}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Badge variant={hasBrandReport ? "success" : "warning"}>
                        {hasBrandReport ? "Branding OK" : "Sem branding"}
                      </Badge>
                      {latestMarket && (
                        <Badge variant={latestMarket.status === "COMPLETED" ? "success" : "warning"}>
                          {latestMarket.status === "COMPLETED" ? "Mercado OK" : "Gerando..."}
                        </Badge>
                      )}
                    </div>

                    {latestMarket?.status === "COMPLETED" ? (
                      <Link href={`/market/report/${latestMarket.id}`}>
                        <Button variant="outline" className="w-full">Ver Relatorio de Mercado</Button>
                      </Link>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                        onClick={() => handleGenerate(company.id)}
                        loading={generating === company.id}
                        disabled={!hasBrandReport}
                      >
                        {!hasBrandReport ? "Branding necessario primeiro" : "Gerar Analise de Mercado"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

const marketTools = [
  { icon: "P", name: "Buying Personas" },
  { icon: "E", name: "Mapa da Empatia" },
  { icon: "S", name: "Analise SWOT" },
  { icon: "T", name: "TAM/SAM/SOM" },
  { icon: "M", name: "Estrategias Mkt" },
  { icon: "Y", name: "Psicologia" },
  { icon: "F", name: "Product-Market Fit" },
  { icon: "C", name: "Brief Criativo" },
]
