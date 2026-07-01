"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/forms/tag-input"

export default function AnaliseEmpresaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/intel/empresa/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      router.push(`/intel/empresa/${data.reportId}`)
    } catch {
      alert("Erro ao gerar análise. Verifique os campos e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Análise da Empresa</h1>
          <p className="text-muted-foreground mt-1">
            Preencha os dados para gerar uma análise estratégica completa com base nas metodologias The Futur e King Kong.
          </p>
        </div>

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
            {loading ? "Gerando análise..." : "🚀 Gerar Análise Estratégica Completa"}
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
