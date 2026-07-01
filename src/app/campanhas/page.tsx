"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Tab = "trafego" | "organico" | "prospeccao"
type Platform = "meta" | "google" | "tiktok"

const platformStatus = {
  meta: { connected: false, label: "Meta Ads", icon: "📘", color: "blue" },
  google: { connected: false, label: "Google Ads", icon: "🔍", color: "red" },
  tiktok: { connected: false, label: "TikTok Ads", icon: "🎵", color: "purple" },
}

export default function CampanhasPage() {
  const [activeTab, setActiveTab] = useState<Tab>("trafego")
  const [platforms, setPlatforms] = useState(platformStatus)
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false)
  const [campaignLoading, setCampaignLoading] = useState(false)
  const [campaignResult, setCampaignResult] = useState<any>(null)
  const [showOptimization, setShowOptimization] = useState(false)
  const [campaignForm, setCampaignForm] = useState({
    objective: "leads",
    budget: "",
    duration: "30",
    targetAudience: "",
    landingPage: "",
    platforms: [] as Platform[],
  })

  const connectPlatform = (platform: Platform) => {
    // In production: OAuth flow with each platform
    setPlatforms((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], connected: true },
    }))
  }

  const handleCreateCampaign = async () => {
    setCampaignLoading(true)
    try {
      const res = await fetch("/api/campanhas/create-auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignForm),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setCampaignResult(data)
    } catch {
      alert("Erro ao criar campanha")
    } finally {
      setCampaignLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Campanhas — Funil Y</h1>
          <p className="text-muted-foreground mt-1">Tráfego pago + orgânico trabalhando juntos para maximizar conversão.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("trafego")}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "trafego" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg" : "bg-card border hover:bg-accent"
            }`}
          >
            🚀 Tráfego Pago
          </button>
          <button
            onClick={() => setActiveTab("prospeccao")}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "prospeccao" ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg" : "bg-card border hover:bg-accent"
            }`}
          >
            🎯 Prospecção Ativa
          </button>
          <button
            onClick={() => setActiveTab("organico")}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "organico" ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg" : "bg-card border hover:bg-accent"
            }`}
          >
            📱 Orgânico
          </button>
        </div>

        {activeTab === "trafego" && (
          <div className="space-y-6">
            {/* Conexão com plataformas */}
            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4">🔌 Plataformas Conectadas</h2>
              <div className="grid grid-cols-3 gap-4">
                {(Object.entries(platforms) as [Platform, typeof platformStatus.meta][]).map(([key, platform]) => (
                  <div key={key} className={`rounded-xl border-2 p-4 text-center ${platform.connected ? "border-emerald-300 bg-emerald-50" : "border-gray-200"}`}>
                    <span className="text-3xl block mb-2">{platform.icon}</span>
                    <h3 className="font-semibold text-sm">{platform.label}</h3>
                    {platform.connected ? (
                      <div className="mt-2">
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">✅ Conectado</span>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => connectPlatform(key)}>
                        Conectar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                💡 Na versão completa: OAuth com cada plataforma para gerenciar campanhas diretamente.
              </p>
            </div>

            {/* Dashboard de campanhas */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">📊 Dashboard de Campanhas</h2>
                <Button size="sm" variant="outline">📄 Relatório Diário</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                {[
                  { label: "Investido", value: "R$ 0", color: "text-gray-600" },
                  { label: "Leads", value: "0", color: "text-blue-600" },
                  { label: "CPL", value: "R$ 0", color: "text-amber-600" },
                  { label: "CTR", value: "0%", color: "text-emerald-600" },
                  { label: "ROAS", value: "0x", color: "text-purple-600" },
                ].map((m) => (
                  <div key={m.label} className="bg-accent/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">Nenhuma campanha ativa. Crie sua primeira campanha abaixo.</p>
              </div>
            </div>

            {/* Otimização automática */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">🧠 Otimização Automática</h2>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">A cada 5 dias</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                O sistema analisa performance a cada 5 dias e sugere otimizações. Nada é alterado sem sua aprovação.
              </p>

              {showOptimization ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-sm text-blue-800">📋 Sugestões de Otimização (Dia 5)</h3>
                  <div className="space-y-2">
                    {[
                      "Aumentar budget do conjunto 'Lookalike 1%' em 20% (melhor CPA)",
                      "Pausar criativo 'Imagem A' (CTR abaixo de 1%)",
                      "Duplicar conjunto 'Interesse Marketing' para teste de público semelhante",
                      "Reduzir bid do Google Search em 15% (CPC acima da meta)",
                    ].map((suggestion, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500 mt-0.5">→</span>
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      ✅ Aprovar e Aplicar
                    </Button>
                    <Button size="sm" variant="outline">❌ Rejeitar</Button>
                    <Button size="sm" variant="outline">✏️ Ajustar</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowOptimization(true)}>
                  Simular Otimização
                </Button>
              )}
            </div>

            {/* Criar campanha */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">🚀 Criar Nova Campanha</h2>
                {!showCampaignBuilder && (
                  <Button onClick={() => setShowCampaignBuilder(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    + Nova Campanha Automática
                  </Button>
                )}
              </div>

              {showCampaignBuilder && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    A IA vai usar os dados das análises da empresa + mercado + criativos gerados para montar a melhor campanha possível.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Objetivo</label>
                      <select
                        value={campaignForm.objective}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, objective: e.target.value }))}
                        className="w-full h-10 rounded-md border px-3 text-sm mt-1"
                      >
                        <option value="leads">Geração de Leads</option>
                        <option value="vendas">Vendas/Conversão</option>
                        <option value="trafego">Tráfego para Site</option>
                        <option value="mensagens">Mensagens no WhatsApp</option>
                        <option value="awareness">Reconhecimento</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Budget diário</label>
                      <Input
                        value={campaignForm.budget}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, budget: e.target.value }))}
                        placeholder="Ex: R$ 50"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Duração (dias)</label>
                      <select
                        value={campaignForm.duration}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, duration: e.target.value }))}
                        className="w-full h-10 rounded-md border px-3 text-sm mt-1"
                      >
                        <option value="7">7 dias (teste)</option>
                        <option value="14">14 dias</option>
                        <option value="30">30 dias</option>
                        <option value="90">90 dias (recomendado)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Landing Page / WhatsApp</label>
                      <Input
                        value={campaignForm.landingPage}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, landingPage: e.target.value }))}
                        placeholder="URL ou número WhatsApp"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Plataformas</label>
                    <div className="flex gap-3">
                      {(["meta", "google", "tiktok"] as Platform[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => setCampaignForm((f) => ({
                            ...f,
                            platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p]
                          }))}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            campaignForm.platforms.includes(p) ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                          }`}
                        >
                          {platforms[p].icon} {platforms[p].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Público-alvo (opcional)</label>
                    <Textarea
                      value={campaignForm.targetAudience}
                      onChange={(e) => setCampaignForm((f) => ({ ...f, targetAudience: e.target.value }))}
                      placeholder="Deixe vazio para a IA definir o melhor público baseado na análise de mercado..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-xs text-emerald-800">
                      🧠 <strong>IA vai automaticamente:</strong> Selecionar os melhores criativos gerados na aba Conteúdo, definir segmentação baseada na análise de mercado, configurar testes A/B, e otimizar para o menor CPA possível.
                    </p>
                  </div>

                  <Button
                    onClick={handleCreateCampaign}
                    disabled={campaignLoading || campaignForm.platforms.length === 0}
                    size="lg"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  >
                    {campaignLoading ? "🧠 Montando campanha com IA..." : "🚀 Criar Campanha Otimizada com IA"}
                  </Button>
                </div>
              )}

              {/* Campaign result */}
              {campaignResult && (
                <div className="mt-6 bg-accent/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-sm">✅ Campanha Criada</h3>
                  {typeof campaignResult === "object" && Object.entries(campaignResult).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-xs font-semibold uppercase text-muted-foreground">{k.replace(/_/g, " ")}</span>
                      {typeof v === "string" ? (
                        <p className="text-sm">{v}</p>
                      ) : Array.isArray(v) ? (
                        <div className="space-y-1 mt-1">{(v as any[]).map((item, i) => (
                          <div key={i} className="text-xs bg-white rounded p-2">
                            {typeof item === "object" ? Object.entries(item).map(([ik, iv]) => (
                              <span key={ik} className="mr-3"><strong>{ik}:</strong> {String(iv)}</span>
                            )) : String(item)}
                          </div>
                        ))}</div>
                      ) : (
                        <p className="text-sm">{JSON.stringify(v)}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "prospeccao" && <ProspeccaoAtiva />}

        {activeTab === "organico" && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-3">📱 Funil Y — Braço Orgânico</h2>
              <p className="text-sm text-muted-foreground mb-4">
                O conteúdo orgânico aquece o público que depois converte via tráfego pago. Os dois braços do funil Y trabalham juntos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-2">🔥 Topo de Funil</h3>
                  <p className="text-xs text-muted-foreground">Conteúdo viral para alcance. Gera no módulo de Conteúdo com tom "Trend/Viral" ou "Controverso".</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => window.location.href = "/conteudo"}>
                    Criar Conteúdo ToFu
                  </Button>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-2">🎯 Meio de Funil</h3>
                  <p className="text-xs text-muted-foreground">Conteúdo educativo e storytelling que gera confiança. Tom "Educativo" ou "Storytelling".</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => window.location.href = "/conteudo"}>
                    Criar Conteúdo MoFu
                  </Button>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-2">💰 Fundo de Funil</h3>
                  <p className="text-xs text-muted-foreground">Conteúdo de prova social e transformação que converte. Tom "Transformação" ou "Bastidores".</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => window.location.href = "/conteudo"}>
                    Criar Conteúdo BoFu
                  </Button>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3">📅 Calendário de Publicação</h3>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
                    <div key={d} className="text-xs font-medium text-muted-foreground py-1">{d}</div>
                  ))}
                  {Array.from({ length: 7 }, (_, i) => (
                    <div key={i} className="bg-accent/30 rounded p-2 text-xs min-h-[60px]">
                      <span className="text-muted-foreground">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Em breve: Calendário editorial automático com sugestão de horários e frequência ideal por plataforma.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-3">🔄 Como o Funil Y Funciona</h2>
              <div className="flex items-center gap-4 justify-center py-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">📱</span>
                  </div>
                  <p className="text-xs font-medium">Orgânico</p>
                  <p className="text-[10px] text-muted-foreground">Aquece público</p>
                </div>
                <div className="text-2xl text-muted-foreground">+</div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <p className="text-xs font-medium">Tráfego Pago</p>
                  <p className="text-[10px] text-muted-foreground">Converte lead</p>
                </div>
                <div className="text-2xl text-muted-foreground">=</div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-xs font-medium">Venda</p>
                  <p className="text-[10px] text-muted-foreground">CRM + SDR IA</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Leads gerados pelo tráfego pago caem direto no CRM e são atendidos pelo SDR IA no WhatsApp.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

function ProspeccaoAtiva() {
  const [searchForm, setSearchForm] = useState({
    nicho: "",
    regiao: "",
    cargo: "",
    tamanhoEmpresa: "",
    plataforma: "linkedin",
  })
  const [loading, setLoading] = useState(false)
  const [prospects, setProspects] = useState<any>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [dailyGoal] = useState(20)
  const [contacted, setContacted] = useState(0)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/campanhas/prospeccao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchForm),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setProspects(data)
    } catch {
      alert("Erro ao buscar prospects")
    } finally {
      setLoading(false)
    }
  }

  const markContacted = () => {
    setContacted((c) => c + 1)
    setScore((s) => s + 10)
    if (contacted + 1 >= dailyGoal) {
      setStreak((s) => s + 1)
      setScore((s) => s + 50) // bonus
    }
  }

  return (
    <div className="space-y-6">
      {/* Gamificação */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">🎯 Prospecção Ativa</h2>
            <p className="text-sm text-white/80">Encontre e contate clientes ideais com IA</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{score} pts</div>
            <div className="text-xs text-white/70">🔥 Streak: {streak} dias</div>
          </div>
        </div>

        {/* Progress bar gamificada */}
        <div className="bg-white/20 rounded-full h-4 mb-2">
          <div
            className="bg-white rounded-full h-4 transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${Math.min((contacted / dailyGoal) * 100, 100)}%` }}
          >
            {contacted > 0 && <span className="text-[10px] text-purple-600 font-bold">{contacted}/{dailyGoal}</span>}
          </div>
        </div>
        <div className="flex justify-between text-xs text-white/70">
          <span>Meta diária: {dailyGoal} contatos</span>
          <span>{contacted >= dailyGoal ? "🏆 Meta batida! +50 pts bonus" : `Faltam ${dailyGoal - contacted}`}</span>
        </div>

        {/* Achievements */}
        <div className="flex gap-2 mt-4">
          {[
            { icon: "🌱", label: "Iniciante", unlocked: score >= 0 },
            { icon: "⚡", label: "10 contatos", unlocked: contacted >= 10 },
            { icon: "🔥", label: "Meta diária", unlocked: contacted >= dailyGoal },
            { icon: "💎", label: "3 dias seguidos", unlocked: streak >= 3 },
            { icon: "🏆", label: "100 pts", unlocked: score >= 100 },
          ].map((badge) => (
            <div
              key={badge.label}
              className={`px-2 py-1 rounded-lg text-xs ${badge.unlocked ? "bg-white/30" : "bg-white/10 opacity-50"}`}
              title={badge.label}
            >
              {badge.icon}
            </div>
          ))}
        </div>
      </div>

      {/* Busca de prospects */}
      <div className="bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">🔍 Encontrar Prospects com IA</h2>
        <p className="text-sm text-muted-foreground mb-4">
          A IA busca o perfil ideal de cliente baseado no seu nicho, região e critérios. Gera lista de contatos com abordagem personalizada.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium">Nicho / Segmento *</label>
            <Input
              value={searchForm.nicho}
              onChange={(e) => setSearchForm((f) => ({ ...f, nicho: e.target.value }))}
              placeholder="Ex: E-commerce de moda, Clínicas estéticas..."
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Região *</label>
            <Input
              value={searchForm.regiao}
              onChange={(e) => setSearchForm((f) => ({ ...f, regiao: e.target.value }))}
              placeholder="Ex: São Paulo, Brasil todo, Online..."
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Cargo do decisor</label>
            <Input
              value={searchForm.cargo}
              onChange={(e) => setSearchForm((f) => ({ ...f, cargo: e.target.value }))}
              placeholder="Ex: CEO, Dono, Gerente de Marketing..."
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tamanho da empresa</label>
            <select
              value={searchForm.tamanhoEmpresa}
              onChange={(e) => setSearchForm((f) => ({ ...f, tamanhoEmpresa: e.target.value }))}
              className="w-full h-10 rounded-md border px-3 text-sm mt-1"
            >
              <option value="">Qualquer</option>
              <option value="micro">Micro (1-9 funcionários)</option>
              <option value="pequena">Pequena (10-49)</option>
              <option value="media">Média (50-199)</option>
              <option value="grande">Grande (200+)</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Onde buscar</label>
          <div className="flex gap-2">
            {[
              { id: "linkedin", label: "LinkedIn", icon: "💼" },
              { id: "instagram", label: "Instagram", icon: "📸" },
              { id: "google_maps", label: "Google Maps", icon: "📍" },
              { id: "sites", label: "Sites/Diretórios", icon: "🌐" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSearchForm((f) => ({ ...f, plataforma: p.id }))}
                className={`px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                  searchForm.plataforma === p.id ? "border-violet-500 bg-violet-50" : "border-gray-200"
                }`}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={loading || !searchForm.nicho || !searchForm.regiao}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white"
        >
          {loading ? "🧠 Buscando com IA..." : "🔍 Buscar Prospects Ideais"}
        </Button>
      </div>

      {/* Resultados */}
      {prospects && (
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📋 Prospects Encontrados</h2>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full">
              {prospects.prospects?.length || 0} contatos
            </span>
          </div>

          {prospects.prospects && Array.isArray(prospects.prospects) ? (
            <div className="space-y-3">
              {prospects.prospects.map((prospect: any, i: number) => (
                <div key={i} className="border rounded-lg p-4 hover:border-violet-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{prospect.nome || prospect.empresa || `Prospect ${i + 1}`}</h3>
                      <p className="text-xs text-muted-foreground">{prospect.cargo || ""} {prospect.empresa ? `• ${prospect.empresa}` : ""}</p>
                      {prospect.contato && <p className="text-xs text-blue-600 mt-1">📞 {prospect.contato}</p>}
                      {prospect.email && <p className="text-xs text-blue-600">✉️ {prospect.email}</p>}
                      {prospect.perfil && <p className="text-xs text-blue-600">🔗 {prospect.perfil}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs" onClick={markContacted}>
                        ✅ Contatei
                      </Button>
                    </div>
                  </div>
                  {prospect.abordagem && (
                    <div className="mt-3 bg-violet-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-violet-800 mb-1">💬 Sugestão de abordagem:</p>
                      <p className="text-xs text-violet-700">{prospect.abordagem}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(prospects).map(([k, v]) => (
                <div key={k} className="bg-accent/50 rounded-lg p-3">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">{k.replace(/_/g, " ")}</span>
                  <p className="text-sm whitespace-pre-wrap mt-1">{typeof v === "string" ? v : JSON.stringify(v, null, 2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Estratégia de abordagem */}
      <div className="bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-3">📖 Playbook de Prospecção</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">1️⃣ Engajamento (Dia 1-2)</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Curta 3 posts do prospect</li>
              <li>• Comente algo relevante em 1 post</li>
              <li>• Veja os stories / interaja</li>
              <li className="text-violet-600 font-medium">+5 pts por ação</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">2️⃣ Conexão (Dia 3)</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Envie mensagem personalizada</li>
              <li>• Mencione algo específico do perfil dele</li>
              <li>• NÃO venda ainda, gere rapport</li>
              <li className="text-blue-600 font-medium">+10 pts por conexão</li>
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">3️⃣ Valor (Dia 4-5)</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Compartilhe um insight valioso</li>
              <li>• Envie um conteúdo que resolva uma dor dele</li>
              <li>• Ofereça ajuda genuína</li>
              <li className="text-amber-600 font-medium">+15 pts por valor entregue</li>
            </ul>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">4️⃣ Convite (Dia 6-7)</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Sugira uma conversa rápida</li>
              <li>• Use: "Vi que você [X], tenho algo que pode ajudar"</li>
              <li>• Ofereça 2 horários específicos</li>
              <li className="text-emerald-600 font-medium">+25 pts por reunião agendada</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Métricas de prospecção */}
      <div className="bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">📊 Métricas de Prospecção</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Contatos feitos", value: contacted.toString(), icon: "📨" },
            { label: "Taxa de resposta", value: "0%", icon: "💬" },
            { label: "Reuniões agendadas", value: "0", icon: "📅" },
            { label: "Conversão", value: "0%", icon: "💰" },
          ].map((m) => (
            <div key={m.label} className="bg-accent/50 rounded-lg p-3 text-center">
              <span className="text-xl block">{m.icon}</span>
              <p className="text-lg font-bold mt-1">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
