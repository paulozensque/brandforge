"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"

export default function WhatsAppPage() {
  const [status, setStatus] = useState<string>("DISCONNECTED")
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sdrActive, setSdrActive] = useState(true)
  const [recentMessages, setRecentMessages] = useState<any[]>([])

  useEffect(() => {
    fetchStatus()
    fetchMessages()
    const interval = setInterval(() => { fetchStatus(); fetchMessages() }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/sdr/whatsapp")
      if (res.ok) {
        const data = await res.json()
        setStatus(data.status)
        setQrCode(data.qrCode)
      }
    } catch {}
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/sdr/conversations")
      if (res.ok) {
        const data = await res.json()
        setRecentMessages(data.slice(0, 10))
      }
    } catch {}
  }

  const handleConnect = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/sdr/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect" }),
      })
      const data = await res.json()
      setStatus(data.status)
      setQrCode(data.qrCode)
      if (data.error) setError(data.error)
    } catch {
      setError("Erro ao conectar")
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    await fetch("/api/sdr/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disconnect" }),
    })
    setStatus("DISCONNECTED")
    setQrCode(null)
  }

  const statusConfig: Record<string, { color: string; label: string; dot: string }> = {
    DISCONNECTED: { color: "text-red-600", label: "Desconectado", dot: "bg-red-400" },
    WAITING_QR: { color: "text-amber-600", label: "Aguardando QR Code", dot: "bg-amber-400 animate-pulse" },
    CONNECTED: { color: "text-emerald-600", label: "Conectado", dot: "bg-emerald-400" },
    ERROR: { color: "text-red-600", label: "Erro de conexão", dot: "bg-red-400" },
  }

  const currentStatus = statusConfig[status] || statusConfig.DISCONNECTED

  return (
    <AppShell>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">WhatsApp & SDR IA</h1>
          <p className="text-muted-foreground mt-1">Conexão, status e controle do atendimento automático.</p>
        </div>

        {/* Status + SDR Toggle */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-3 h-3 rounded-full ${currentStatus.dot}`}></div>
              <span className={`text-sm font-medium ${currentStatus.color}`}>{currentStatus.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">WhatsApp</p>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${sdrActive ? "bg-emerald-400 animate-pulse" : "bg-gray-300"}`}></div>
                  <span className={`text-sm font-medium ${sdrActive ? "text-emerald-600" : "text-gray-500"}`}>
                    {sdrActive ? "SDR IA Ativo" : "SDR IA Pausado"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Atendimento automático</p>
              </div>
              <button
                onClick={() => setSdrActive(!sdrActive)}
                className={`w-12 h-6 rounded-full transition-all relative ${sdrActive ? "bg-emerald-500" : "bg-gray-300"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${sdrActive ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* QR Code / Connection */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          {status === "CONNECTED" ? (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 mx-auto flex items-center justify-center">
                <span className="text-4xl">✅</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-emerald-700">WhatsApp Conectado!</p>
                <p className="text-sm text-muted-foreground">
                  {sdrActive ? "O SDR IA está ativo e respondendo mensagens automaticamente." : "SDR pausado. Mensagens serão recebidas mas não respondidas automaticamente."}
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={handleDisconnect}>Desconectar</Button>
                <Button variant="outline" size="sm" onClick={handleConnect}>🔄 Reconectar</Button>
              </div>
            </div>
          ) : status === "WAITING_QR" && qrCode ? (
            <div className="text-center space-y-4">
              {qrCode.length > 100 ? (
                <img
                  src={qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`}
                  alt="QR Code"
                  className="w-64 h-64 mx-auto rounded-2xl border-2 shadow-lg"
                />
              ) : (
                <div className="w-64 h-64 mx-auto bg-gray-100 rounded-2xl border flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Carregando QR...</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">📱 Escaneie com WhatsApp → Aparelhos conectados</p>
              <Button variant="outline" size="sm" onClick={handleConnect}>🔄 Novo QR Code</Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto flex items-center justify-center">
                <span className="text-4xl">📱</span>
              </div>
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleConnect} disabled={loading}>
                {loading ? "Gerando QR Code..." : "Conectar WhatsApp"}
              </Button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          )}
        </div>

        {/* Últimas conversas */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">💬 Últimas Conversas</h2>
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/sdr/conversas"}>Ver todas</Button>
          </div>

          {recentMessages.length > 0 ? (
            <div className="space-y-3">
              {recentMessages.map((conv: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-all">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">👤</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.lead?.name || conv.lead?.phone || "Lead"}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.messages?.[0]?.content || "..."}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      conv.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}>{conv.status === "ACTIVE" ? "Ativa" : "Concluída"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-3xl block mb-2">💬</span>
              <p className="text-sm">Nenhuma conversa ainda.</p>
              <p className="text-xs mt-1">Quando alguém enviar mensagem, aparecerá aqui e o SDR IA responderá automaticamente.</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 bg-card rounded-lg border p-4">
          <h3 className="text-sm font-medium mb-2">ℹ️ Como funciona:</h3>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Alguém envia mensagem no seu WhatsApp</li>
            <li>A mensagem chega aqui e cria um lead no CRM automaticamente</li>
            <li>O SDR IA responde seguindo o fluxo de qualificação configurado</li>
            <li>Quando qualificado, sugere reunião e registra no agendamento</li>
          </ol>
        </div>
      </div>
    </AppShell>
  )
}
