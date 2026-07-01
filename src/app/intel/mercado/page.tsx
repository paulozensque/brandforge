"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/forms/tag-input"

export default function AnaliseMercadoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }))

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
      router.push(`/intel/mercado/${data.reportId}`)
    } catch {
      alert("Erro ao gerar análise de mercado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Análise de Mercado</h1>
          <p className="text-muted-foreground mt-1">
            Mapeie seu mercado, concorrentes e oportunidades com análise estratégica baseada em dados.
          </p>
        </div>

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
            {loading ? "Analisando mercado..." : "📊 Gerar Análise de Mercado Completa"}
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
