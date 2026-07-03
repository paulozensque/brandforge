"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const STORAGE_KEY = "eco-identidade-form"

export default function IdentidadeVisualPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [form, setForm] = useState({
    companyName: "",
    segment: "",
    personality: [] as string[],
    colorPreference: "",
    stylePreference: "",
    targetAudience: "",
    feeling: "",
    avoidColors: "",
    references: "",
    hasLogo: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setForm(JSON.parse(saved))
    }
  }, [])

  const update = (field: string, value: any) => {
    setForm((f) => {
      const updated = { ...f, [field]: value }
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const toggleMulti = (field: string, value: string, max: number) => {
    const current = (form as any)[field] || []
    const updated = current.includes(value) ? current.filter((c: string) => c !== value) : current.length < max ? [...current, value] : current
    update(field, updated)
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/intel/identidade/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setResult(data)
    } catch {
      alert("Erro ao gerar identidade visual.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const text = `IDENTIDADE VISUAL - ${form.companyName}\n${"=".repeat(50)}\nGerado por ECO by Zen Power\n\n${JSON.stringify(result, null, 2).replace(/[{}\[\]"]/g, "").replace(/,\n/g, "\n")}`
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `identidade-visual-${form.companyName || "marca"}-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
  }

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">🎨 Identidade Visual</h1>
          <p className="text-muted-foreground mt-1">
            Responda as perguntas abaixo e a IA criará 3 propostas de identidade visual diferentes para sua marca.
          </p>
        </div>

        {!result ? (
          <div className="space-y-6">
            {/* Nome e segmento */}
            <section className="bg-card rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">1️⃣ Sobre a marca</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome da marca *</label>
                  <Input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="Ex: Zen Power" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Segmento</label>
                  <select value={form.segment} onChange={(e) => update("segment", e.target.value)} className="w-full h-10 rounded-md border px-3 text-sm mt-1">
                    <option value="">Selecione...</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Saúde/Bem-estar">Saúde/Bem-estar</option>
                    <option value="Educação">Educação</option>
                    <option value="Moda/Lifestyle">Moda/Lifestyle</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Finanças">Finanças</option>
                    <option value="Consultoria">Consultoria</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Já tem logo?</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["Sim, quero manter", "Sim, mas quero mudar", "Não tenho logo"].map(opt => (
                    <button key={opt} onClick={() => update("hasLogo", opt)}
                      className={`px-3 py-2 rounded-lg border text-xs transition-all ${form.hasLogo === opt ? "border-purple-500 bg-purple-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                  ))}
                </div>
              </div>
            </section>

            {/* Personalidade */}
            <section className="bg-card rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">2️⃣ Personalidade da marca</h2>
              <p className="text-xs text-muted-foreground">Se a marca fosse uma pessoa, como ela seria? (selecione até 4)</p>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {[
                  "Moderna", "Clássica", "Ousada", "Minimalista",
                  "Luxuosa", "Acessível", "Divertida", "Séria",
                  "Feminina", "Masculina", "Neutra", "Jovem",
                  "Tecnológica", "Orgânica", "Artística", "Corporativa"
                ].map(opt => (
                  <button key={opt} onClick={() => toggleMulti("personality", opt, 4)}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${(form.personality || []).includes(opt) ? "border-purple-500 bg-purple-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </section>

            {/* Cores */}
            <section className="bg-card rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">3️⃣ Preferência de cores</h2>
              <div>
                <label className="text-sm font-medium">Qual família de cores te atrai?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {[
                    { value: "Azul / Confiança", color: "bg-blue-500" },
                    { value: "Verde / Crescimento", color: "bg-emerald-500" },
                    { value: "Vermelho / Energia", color: "bg-red-500" },
                    { value: "Roxo / Premium", color: "bg-purple-500" },
                    { value: "Laranja / Criatividade", color: "bg-orange-500" },
                    { value: "Preto / Elegância", color: "bg-gray-900" },
                    { value: "Dourado / Luxo", color: "bg-yellow-600" },
                    { value: "Sem preferência", color: "bg-gradient-to-r from-pink-500 via-blue-500 to-green-500" },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => update("colorPreference", opt.value)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${form.colorPreference === opt.value ? "border-purple-500 shadow-md scale-105" : "border-gray-200 hover:border-gray-400"}`}>
                      <div className={`w-8 h-8 rounded-full ${opt.color} mx-auto mb-1`} />
                      <span className="text-xs">{opt.value}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Cores que NÃO quer usar</label>
                <Input value={form.avoidColors} onChange={(e) => update("avoidColors", e.target.value)} placeholder="Ex: Rosa, amarelo neon..." className="mt-1" />
              </div>
            </section>

            {/* Estilo */}
            <section className="bg-card rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">4️⃣ Estilo visual</h2>
              <div>
                <label className="text-sm font-medium">Qual estilo visual combina mais com a marca?</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {[
                    { value: "Minimalista", desc: "Clean, espaço, poucos elementos", icon: "⬜" },
                    { value: "Bold/Impactante", desc: "Cores fortes, tipografia grande", icon: "💥" },
                    { value: "Elegante/Sofisticado", desc: "Serifa, dourado, refinado", icon: "👑" },
                    { value: "Moderno/Tech", desc: "Geométrico, gradientes, futurista", icon: "🔮" },
                    { value: "Orgânico/Natural", desc: "Curvas, verde, texturas naturais", icon: "🌿" },
                    { value: "Retrô/Vintage", desc: "Nostálgico, tipografia clássica", icon: "📻" },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => update("stylePreference", opt.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${form.stylePreference === opt.value ? "border-purple-500 bg-purple-50 shadow-md" : "border-gray-200 hover:border-gray-400"}`}>
                      <span className="text-2xl block mb-1">{opt.icon}</span>
                      <span className="text-sm font-medium block">{opt.value}</span>
                      <span className="text-xs text-muted-foreground">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Sentimento */}
            <section className="bg-card rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">5️⃣ Que sensação a marca deve transmitir?</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  "Confiança e segurança", "Inovação e futuro", "Exclusividade e luxo",
                  "Proximidade e calor humano", "Energia e motivação", "Tranquilidade e equilíbrio",
                  "Autoridade e poder", "Criatividade e diversão", "Resultado e performance"
                ].map(opt => (
                  <button key={opt} onClick={() => update("feeling", opt)}
                    className={`px-3 py-2 rounded-lg border text-xs text-left transition-all ${form.feeling === opt ? "border-purple-500 bg-purple-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </section>

            {/* Extra */}
            <section className="bg-card rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">6️⃣ Referências (opcional)</h2>
              <div>
                <label className="text-sm font-medium">Marcas com visual que admira</label>
                <Input value={form.references} onChange={(e) => update("references", e.target.value)} placeholder="Ex: Apple, Nubank, Nike, Louis Vuitton..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Público principal</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["Jovens (18-30)", "Adultos (30-50)", "Executivos/Empresários", "Mulheres", "Homens", "Todos"].map(opt => (
                    <button key={opt} onClick={() => update("targetAudience", opt)}
                      className={`px-3 py-2 rounded-lg border text-xs transition-all ${form.targetAudience === opt ? "border-purple-500 bg-purple-50 font-medium" : "hover:border-gray-400"}`}>{opt}</button>
                  ))}
                </div>
              </div>
            </section>

            <Button onClick={handleGenerate} disabled={loading || !form.companyName} size="lg" className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              {loading ? "🎨 Criando 3 propostas de identidade..." : "🎨 Gerar 3 Propostas de Identidade Visual"}
            </Button>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            <div className="flex gap-2 mb-4">
              <Button onClick={handleDownload} variant="outline">📄 Baixar Identidade Visual</Button>
              <Button onClick={() => setResult(null)} variant="outline">🔄 Gerar Novamente</Button>
            </div>

            {result.propostas && Array.isArray(result.propostas) ? result.propostas.map((proposta: any, i: number) => (
              <div key={i} className="bg-card rounded-xl border overflow-hidden">
                <div className={`p-4 ${i === 0 ? "bg-purple-50" : i === 1 ? "bg-blue-50" : "bg-emerald-50"}`}>
                  <h3 className="font-bold text-lg">Proposta {i + 1}: {proposta.nome || `Opção ${i + 1}`}</h3>
                  <p className="text-sm text-muted-foreground">{proposta.conceito || ""}</p>
                </div>
                <div className="p-6 space-y-4">
                  {/* Colors */}
                  {proposta.cores && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">🎨 Paleta de Cores</h4>
                      <div className="flex gap-2">
                        {(Array.isArray(proposta.cores) ? proposta.cores : [proposta.cores]).map((cor: any, ci: number) => (
                          <div key={ci} className="text-center">
                            <div className="w-12 h-12 rounded-lg border shadow-sm" style={{ backgroundColor: typeof cor === "string" ? cor : cor.hex || "#ccc" }} />
                            <p className="text-[10px] mt-1 text-muted-foreground">{typeof cor === "string" ? cor : cor.nome || cor.hex}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Typography */}
                  {proposta.tipografia && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">🔤 Tipografia</h4>
                      <p className="text-sm">{typeof proposta.tipografia === "string" ? proposta.tipografia : JSON.stringify(proposta.tipografia)}</p>
                    </div>
                  )}
                  {/* Style */}
                  {proposta.estilo && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">✨ Estilo</h4>
                      <p className="text-sm">{proposta.estilo}</p>
                    </div>
                  )}
                  {/* Logo direction */}
                  {proposta.direcao_logo && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">🏷️ Direção do Logo</h4>
                      <p className="text-sm">{proposta.direcao_logo}</p>
                    </div>
                  )}
                  {/* Application */}
                  {proposta.aplicacoes && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">📱 Aplicações</h4>
                      <p className="text-sm">{typeof proposta.aplicacoes === "string" ? proposta.aplicacoes : JSON.stringify(proposta.aplicacoes)}</p>
                    </div>
                  )}
                  {/* Mood */}
                  {proposta.mood && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">💭 Mood/Sensação</h4>
                      <p className="text-sm">{proposta.mood}</p>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="bg-card rounded-xl border p-6">
                <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
