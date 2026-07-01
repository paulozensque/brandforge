"use client"

import { useState, useRef } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Mode = null | "conteudo" | "criativo"
type Format = null | "video" | "imagem" | "carrossel"

const tonsConteudo = [
  { id: "educativo", label: "📚 Educativo", desc: "Ensina algo valioso, gera autoridade" },
  { id: "storytelling", label: "📖 Storytelling", desc: "Conta uma história envolvente" },
  { id: "bastidores", label: "🎬 Bastidores", desc: "Mostra o dia a dia, humaniza" },
  { id: "controverso", label: "🔥 Controverso", desc: "Opinião forte, gera debate" },
  { id: "transformacao", label: "✨ Transformação", desc: "Antes e depois, resultado" },
  { id: "tendencia", label: "🚀 Trend/Viral", desc: "Usa formato trending do momento" },
]

const tonsCriativo = [
  { id: "dor", label: "😰 Dor Urgente", desc: "Apela para a dor do público" },
  { id: "curiosidade", label: "🤔 Curiosidade", desc: "Hook que prende atenção" },
  { id: "prova_social", label: "⭐ Prova Social", desc: "Depoimentos e resultados" },
  { id: "escassez", label: "⏰ Escassez/Urgência", desc: "Oferta limitada, urgência" },
  { id: "autoridade", label: "🏆 Autoridade", desc: "Expert, dados, credibilidade" },
  { id: "oferta_direta", label: "💰 Oferta Direta", desc: "CTA forte, benefícios claros" },
]

export default function ConteudoPage() {
  const [mode, setMode] = useState<Mode>(null)
  const [format, setFormat] = useState<Format>(null)
  const [selectedTom, setSelectedTom] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [extraContext, setExtraContext] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [savedMedias, setSavedMedias] = useState<string[]>([])
  const [generatedImage, setGeneratedImage] = useState<{ url?: string; prompt: string; generated: boolean; message?: string } | null>(null)
  const [generatingImage, setGeneratingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
    const newMedias = files.map((f) => f.name)
    setSavedMedias((prev) => [...prev, ...newMedias])
  }

  const handleGenerate = async () => {
    if (!mode || !format || !selectedTom) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/conteudo/generate-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          format,
          tom: selectedTom,
          extraContext,
          mediaFiles: savedMedias,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setResult(data)
    } catch {
      alert("Erro ao gerar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const tonsToShow = mode === "conteudo" ? tonsConteudo : tonsCriativo

  const handleGenerateImage = async (prompt: string) => {
    setGeneratingImage(true)
    setGeneratedImage(null)
    try {
      const res = await fetch("/api/conteudo/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          size: format === "video" ? "1792x1024" : "1024x1024",
          style: mode === "criativo" ? "vivid" : "natural",
        }),
      })
      const data = await res.json()
      setGeneratedImage(data)
    } catch {
      alert("Erro ao gerar imagem")
    } finally {
      setGeneratingImage(false)
    }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Produção de Conteúdo & Criativos</h1>
          <p className="text-muted-foreground mt-1">
            Crie conteúdos virais e criativos de alta conversão com IA, baseados na análise da sua marca.
          </p>
        </div>

        {/* Upload de mídias */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">📸 Mídias da Empresa</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Envie os arquivos abaixo para que a IA crie conteúdos personalizados com sua imagem e voz.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Foto */}
            <div className="border-2 border-dashed rounded-xl p-5 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  setUploadedFiles((prev) => [...prev, ...files])
                  setSavedMedias((prev) => [...prev, ...files.map((f) => `[FOTO] ${f.name}`)])
                }}
                className="hidden"
                id="photo-upload"
              />
              <span className="text-4xl block mb-2">📷</span>
              <h3 className="font-semibold text-sm mb-1">Foto do Rosto</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Envie uma foto <strong>clara, bem iluminada e com o rosto de quem irá aparecer</strong> nos conteúdos. Fundo neutro de preferência.
              </p>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Enviar Foto
              </Button>
              {savedMedias.filter((m) => m.startsWith("[FOTO]")).length > 0 && (
                <div className="mt-3 space-y-1">
                  {savedMedias.filter((m) => m.startsWith("[FOTO]")).map((name, i) => (
                    <div key={i} className="text-xs bg-emerald-50 text-emerald-700 rounded px-2 py-1 flex items-center gap-1">
                      <span>✅</span> {name.replace("[FOTO] ", "")}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vídeo */}
            <div className="border-2 border-dashed rounded-xl p-5 text-center">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  setUploadedFiles((prev) => [...prev, ...files])
                  setSavedMedias((prev) => [...prev, ...files.map((f) => `[VIDEO] ${f.name}`)])
                }}
                className="hidden"
                id="video-upload"
              />
              <span className="text-4xl block mb-2">🎥</span>
              <h3 className="font-semibold text-sm mb-1">Vídeo com Voz</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Envie um vídeo <strong>falando sobre a empresa, com a voz da pessoa que irá aparecer</strong> nos conteúdos. Mínimo 30 segundos.
              </p>
              <Button variant="outline" size="sm" onClick={() => (document.getElementById("video-upload") as HTMLInputElement)?.click()}>
                Enviar Vídeo
              </Button>
              {savedMedias.filter((m) => m.startsWith("[VIDEO]")).length > 0 && (
                <div className="mt-3 space-y-1">
                  {savedMedias.filter((m) => m.startsWith("[VIDEO]")).map((name, i) => (
                    <div key={i} className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-1 flex items-center gap-1">
                      <span>✅</span> {name.replace("[VIDEO] ", "")}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {savedMedias.length === 0 && (
            <p className="text-xs text-amber-600 mt-3">⚠️ Envie pelo menos uma foto e um vídeo para melhores resultados.</p>
          )}
          {savedMedias.filter((m) => m.startsWith("[FOTO]")).length > 0 && savedMedias.filter((m) => m.startsWith("[VIDEO]")).length > 0 && (
            <p className="text-xs text-emerald-600 mt-3">✅ Foto e vídeo enviados! A IA usará como referência para criar conteúdos personalizados.</p>
          )}
        </div>

        {/* Step 1: Escolher modo */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">1️⃣ O que deseja criar?</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setMode("conteudo"); setSelectedTom(null); setResult(null) }}
              className={`p-6 rounded-xl border-2 text-center transition-all ${
                mode === "conteudo" ? "border-emerald-500 bg-emerald-50 shadow-md" : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              <span className="text-4xl block mb-2">✍️</span>
              <h3 className="font-bold text-lg">Conteúdo</h3>
              <p className="text-xs text-muted-foreground mt-1">Posts virais para engajamento, alcance e autoridade</p>
            </button>
            <button
              onClick={() => { setMode("criativo"); setSelectedTom(null); setResult(null) }}
              className={`p-6 rounded-xl border-2 text-center transition-all ${
                mode === "criativo" ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <span className="text-4xl block mb-2">🎯</span>
              <h3 className="font-bold text-lg">Criativo</h3>
              <p className="text-xs text-muted-foreground mt-1">Anúncios de alta conversão para Meta, Google e TikTok</p>
            </button>
          </div>
        </div>

        {/* Step 2: Formato */}
        {mode && (
          <div className="bg-card rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">2️⃣ Formato</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "video" as Format, icon: "🎥", label: "Vídeo", desc: "Roteiro + direção" },
                { id: "imagem" as Format, icon: "🖼️", label: "Imagem", desc: "Copy + prompt visual" },
                { id: "carrossel" as Format, icon: "📑", label: "Carrossel", desc: "Slides com copy" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    format === f.id
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-3xl block mb-1">{f.icon}</span>
                  <h3 className="font-semibold">{f.label}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Tom */}
        {mode && format && (
          <div className="bg-card rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">
              3️⃣ Tom {mode === "conteudo" ? "do Conteúdo" : "do Criativo"}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              {mode === "conteudo"
                ? "Escolha o estilo viral. Baseado nos formatos com maior engajamento da internet."
                : "Escolha a abordagem de conversão. Baseado nos criativos com maior CTR e ROAS do mercado."}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tonsToShow.map((tom) => (
                <button
                  key={tom.id}
                  onClick={() => setSelectedTom(tom.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedTom === tom.id
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium text-sm">{tom.label}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{tom.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Contexto extra + Gerar */}
        {mode && format && selectedTom && (
          <div className="bg-card rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">4️⃣ Contexto Adicional (opcional)</h2>
            <Textarea
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              placeholder="Algo específico que quer abordar? Ex: 'Lançamento do produto X', 'Focar na dor de não ter leads'..."
              rows={3}
            />
            <Button
              onClick={handleGenerate}
              disabled={loading}
              size="lg"
              className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
            >
              {loading ? "🧠 Gerando com IA..." : `🚀 Gerar ${mode === "conteudo" ? "Conteúdo Viral" : "Criativo de Alta Conversão"}`}
            </Button>
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                ✅ {mode === "conteudo" ? "Conteúdo" : "Criativo"} Gerado
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                {format} • {selectedTom}
              </span>
            </div>
            <div className="space-y-4">
              {result.content ? (
                Array.isArray(result.content) ? result.content.map((item: any, i: number) => (
                  <div key={i} className="bg-accent/50 rounded-lg p-4 space-y-2">
                    {typeof item === "object" ? (
                      Object.entries(item).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-xs font-semibold uppercase text-muted-foreground">{k.replace(/_/g, " ")}</span>
                          <p className="text-sm whitespace-pre-wrap mt-0.5">{String(v)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{String(item)}</p>
                    )}
                  </div>
                )) : (
                  Object.entries(result.content).map(([k, v]) => (
                    <div key={k} className="bg-accent/50 rounded-lg p-4">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">{k.replace(/_/g, " ")}</span>
                      {typeof v === "string" ? (
                        <p className="text-sm whitespace-pre-wrap mt-1">{v}</p>
                      ) : Array.isArray(v) ? (
                        <div className="space-y-2 mt-1">
                          {(v as any[]).map((item, i) => (
                            <div key={i} className="text-sm bg-white/50 rounded p-2">
                              {typeof item === "object" ? Object.entries(item).map(([ik, iv]) => (
                                <div key={ik}><span className="font-medium text-muted-foreground text-xs">{ik}:</span> {String(iv)}</div>
                              )) : String(item)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm mt-1">{JSON.stringify(v, null, 2)}</p>
                      )}
                    </div>
                  ))
                )
              ) : (
                <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
              )}

              {/* Gerar Imagem com IA */}
              {(format === "imagem" || format === "carrossel") && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">🎨 Gerar Visual com IA</h3>
                  <Button
                    onClick={() => {
                      const promptVisual = result.content?.prompt_visual || result.content?.dica_visual || 
                        `Professional ${mode === "criativo" ? "advertisement" : "social media post"} visual for: ${result.content?.headline_principal || result.content?.hook || "brand content"}`
                      handleGenerateImage(promptVisual)
                    }}
                    disabled={generatingImage}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {generatingImage ? "🎨 Gerando imagem..." : "🖼️ Gerar Imagem com DALL-E 3"}
                  </Button>

                  {generatedImage && (
                    <div className="mt-4">
                      {generatedImage.generated && generatedImage.url ? (
                        <div className="space-y-3">
                          <img
                            src={generatedImage.url}
                            alt="Imagem gerada por IA"
                            className="w-full max-w-md rounded-xl border shadow-lg"
                          />
                          <p className="text-xs text-muted-foreground">
                            Prompt usado: {generatedImage.revised_prompt || generatedImage.prompt}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-amber-800 mb-2">⚠️ API Key necessária</p>
                          <p className="text-xs text-amber-700 mb-3">{generatedImage.message}</p>
                          <div className="bg-white/80 rounded p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Prompt para copiar:</p>
                            <p className="text-sm font-mono bg-gray-100 p-2 rounded">{generatedImage.prompt}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3">
                            Adicione <code className="bg-gray-100 px-1 rounded">OPENAI_IMAGE_KEY=sk-...</code> no .env para gerar direto aqui.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
