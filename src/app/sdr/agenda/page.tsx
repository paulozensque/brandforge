"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Meeting {
  id: string
  date: string
  duration: number
  status: string
  notes: string | null
  lead: { id: string; name: string | null; phone: string; score: number }
}

export default function AgendaPage() {
  const [config, setConfig] = useState<any>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [form, setForm] = useState({
    availableDays: ["seg", "ter", "qua", "qui", "sex"],
    startTime: "09:00",
    endTime: "18:00",
    meetingDuration: 30,
    responsible: "",
  })

  useEffect(() => {
    loadCalendar()
    // Check URL params for callback status
    const params = new URLSearchParams(window.location.search)
    if (params.get("connected") === "true") {
      alert("✅ Google Calendar conectado com sucesso!")
      window.history.replaceState({}, "", "/sdr/agenda")
    }
    if (params.get("error")) {
      alert("❌ Erro ao conectar Google Calendar. Tente novamente.")
      window.history.replaceState({}, "", "/sdr/agenda")
    }
  }, [])

  const loadCalendar = async () => {
    try {
      const res = await fetch("/api/sdr/calendar")
      if (res.ok) {
        const data = await res.json()
        if (data.config) {
          setConfig(data.config)
          setForm({
            availableDays: data.config.availableDays || ["seg", "ter", "qua", "qui", "sex"],
            startTime: data.config.startTime || "09:00",
            endTime: data.config.endTime || "18:00",
            meetingDuration: data.config.meetingDuration || 30,
            responsible: data.config.responsible || "",
          })
        }
        setMeetings(data.meetings || [])
      }
    } catch {}
    setLoading(false)
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      await fetch("/api/sdr/calendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      loadCalendar()
    } catch {}
    setSaving(false)
  }

  const connectGoogleCalendar = async () => {
    setConnecting(true)
    try {
      const res = await fetch("/api/sdr/calendar?action=auth-url")
      if (res.ok) {
        const data = await res.json()
        window.location.href = data.url
      }
    } catch {}
    setConnecting(false)
  }

  const disconnectGoogle = async () => {
    if (!confirm("Desconectar Google Calendar?")) return
    await fetch("/api/sdr/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disconnect" }),
    })
    loadCalendar()
  }

  const toggleDay = (day: string) => {
    setForm(f => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter(d => d !== day)
        : [...f.availableDays, day],
    }))
  }

  const allDays = [
    { key: "seg", label: "Seg" },
    { key: "ter", label: "Ter" },
    { key: "qua", label: "Qua" },
    { key: "qui", label: "Qui" },
    { key: "sex", label: "Sex" },
    { key: "sab", label: "Sáb" },
    { key: "dom", label: "Dom" },
  ]

  const statusLabel = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      SCHEDULED: { label: "Agendada", color: "bg-blue-100 text-blue-700" },
      CONFIRMED: { label: "Confirmada", color: "bg-emerald-100 text-emerald-700" },
      COMPLETED: { label: "Realizada", color: "bg-gray-100 text-gray-700" },
      CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-700" },
      NO_SHOW: { label: "Não compareceu", color: "bg-amber-100 text-amber-700" },
    }
    return map[status] || { label: status, color: "bg-gray-100" }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="p-8 flex items-center justify-center h-[50vh]">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">📅 Agendamento</h1>
          <p className="text-muted-foreground mt-1">Configure disponibilidade e conecte Google Calendar para agendamento automático.</p>
        </div>

        <div className="space-y-6">
          {/* Google Calendar Connection */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">🔗 Google Calendar</h2>
              {config?.googleConnected && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">✅ Conectado</span>
              )}
            </div>

            {config?.googleConnected ? (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm text-emerald-800">
                    ✅ Google Calendar conectado! O SDR IA agora consulta seus horários livres antes de sugerir agendamentos.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-xs text-muted-foreground">
                    <p>• Horários ocupados são respeitados automaticamente</p>
                    <p>• Reuniões agendadas são adicionadas ao seu calendário</p>
                    <p>• Lembretes de 15min antes da reunião</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={disconnectGoogle}>
                    Desconectar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Conecte seu Google Calendar para que o SDR IA consulte seus horários livres e agende reuniões automaticamente.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 mb-2">O que a integração faz:</p>
                  <ul className="text-xs text-blue-700 space-y-0.5">
                    <li>📋 Consulta horários ocupados para não conflitar</li>
                    <li>📅 Cria eventos automaticamente quando lead agenda</li>
                    <li>🔔 Envia notificações/lembretes</li>
                    <li>🔒 Acesso seguro via OAuth (Google padrão)</li>
                  </ul>
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  onClick={connectGoogleCalendar}
                  disabled={connecting}
                >
                  <span className="mr-2">
                    <svg className="w-5 h-5 inline" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </span>
                  {connecting ? "Conectando..." : "Conectar Google Calendar"}
                </Button>
              </div>
            )}
          </div>

          {/* Configuração de disponibilidade */}
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">⏰ Disponibilidade</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duração da reunião</label>
                <select 
                  value={form.meetingDuration}
                  onChange={(e) => setForm(f => ({ ...f, meetingDuration: parseInt(e.target.value) }))}
                  className="w-full h-10 rounded-md border px-3 text-sm mt-1"
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Responsável</label>
                <Input 
                  value={form.responsible} 
                  onChange={(e) => setForm(f => ({ ...f, responsible: e.target.value }))}
                  placeholder="Nome do responsável comercial" 
                  className="mt-1" 
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Dias disponíveis</label>
              <div className="flex gap-2">
                {allDays.map((day) => (
                  <button 
                    key={day.key} 
                    onClick={() => toggleDay(day.key)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      form.availableDays.includes(day.key) 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300" 
                        : "bg-gray-50 text-gray-400 border-gray-200"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Horário início</label>
                <Input 
                  type="time" 
                  value={form.startTime}
                  onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))}
                  className="mt-1" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Horário fim</label>
                <Input 
                  type="time" 
                  value={form.endTime}
                  onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))}
                  className="mt-1" 
                />
              </div>
            </div>

            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white" 
              onClick={saveConfig}
              disabled={saving}
            >
              {saving ? "Salvando..." : "💾 Salvar Disponibilidade"}
            </Button>
          </div>

          {/* Próximas Reuniões */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">📋 Próximas Reuniões</h2>
            {meetings.length > 0 ? (
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center gap-4 p-3 rounded-lg border bg-accent/30">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-blue-800">
                          {new Date(meeting.date).toLocaleDateString("pt-BR", { day: "2-digit" })}
                        </p>
                        <p className="text-[9px] text-blue-600">
                          {new Date(meeting.date).toLocaleDateString("pt-BR", { month: "short" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{meeting.lead?.name || meeting.lead?.phone}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(meeting.date).toLocaleDateString("pt-BR", { weekday: "short" })} às{" "}
                        {new Date(meeting.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        {" "}• {meeting.duration}min
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusLabel(meeting.status).color}`}>
                      {statusLabel(meeting.status).label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl block mb-2">📅</span>
                <p className="text-sm">Nenhuma reunião agendada.</p>
                <p className="text-xs mt-1">Quando o SDR IA qualificar um lead, sugerirá horários e agendará automaticamente.</p>
              </div>
            )}
          </div>

          {/* Como funciona */}
          <div className="bg-card rounded-lg border p-4">
            <h3 className="text-sm font-medium mb-2">🤖 Como o agendamento automático funciona:</h3>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Lead demonstra interesse alto (score 60+) ou pede para agendar</li>
              <li>SDR IA consulta seus horários livres no Google Calendar</li>
              <li>Sugere 2 horários disponíveis em dias diferentes</li>
              <li>Lead confirma o horário pelo WhatsApp</li>
              <li>Evento é criado automaticamente no Google Calendar com lembrete</li>
              <li>Lead recebe confirmação e lead é atualizado no CRM</li>
            </ol>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
