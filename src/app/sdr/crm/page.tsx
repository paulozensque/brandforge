"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"

interface Lead {
  id: string
  name: string | null
  phone: string
  email: string | null
  company: string | null
  origin: string | null
  status: string
  score: number
  classification: string
  interest: string | null
  lastMessage: string | null
  nextAction: string | null
  meetingDate: string | null
  createdAt: string
  updatedAt: string
  conversations: any[]
  meetings: any[]
}

const stages = [
  { key: "novo_lead", name: "Novo Lead", icon: "🆕", color: "border-blue-300 bg-blue-50" },
  { key: "em_atendimento", name: "Em Atendimento", icon: "💬", color: "border-amber-300 bg-amber-50" },
  { key: "qualificado", name: "Qualificado", icon: "✅", color: "border-green-300 bg-green-50" },
  { key: "reuniao_sugerida", name: "Reunião Sugerida", icon: "📅", color: "border-purple-300 bg-purple-50" },
  { key: "reuniao_agendada", name: "Reunião Agendada", icon: "🤝", color: "border-indigo-300 bg-indigo-50" },
  { key: "proposta_enviada", name: "Proposta Enviada", icon: "📄", color: "border-orange-300 bg-orange-50" },
  { key: "negociacao", name: "Negociação", icon: "💰", color: "border-pink-300 bg-pink-50" },
  { key: "fechado_ganho", name: "Fechado ✓", icon: "🏆", color: "border-emerald-300 bg-emerald-50" },
  { key: "fechado_perdido", name: "Perdido", icon: "❌", color: "border-red-300 bg-red-50" },
]

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeads()
    const interval = setInterval(fetchLeads, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/sdr/leads")
      if (res.ok) {
        const data = await res.json()
        setLeads(data)
      }
    } catch {}
    setLoading(false)
  }

  const getLeadsByStage = (stageKey: string) => 
    leads.filter(l => l.status === stageKey)

  const scoreColor = (score: number) => {
    if (score >= 61) return "bg-red-100 text-red-700"
    if (score >= 31) return "bg-amber-100 text-amber-700"
    return "bg-blue-100 text-blue-700"
  }

  const totalLeads = leads.length
  const hotLeads = leads.filter(l => l.classification === "HOT").length
  const warmLeads = leads.filter(l => l.classification === "WARM").length

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
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">📋 CRM Kanban</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Pipeline de vendas automático via SDR IA</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-card rounded-lg border px-3 py-1.5 text-center">
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{totalLeads}</p>
            </div>
            <div className="bg-card rounded-lg border px-3 py-1.5 text-center">
              <p className="text-[10px] text-muted-foreground">🔥 Quentes</p>
              <p className="text-lg font-bold text-red-600">{hotLeads}</p>
            </div>
            <div className="bg-card rounded-lg border px-3 py-1.5 text-center">
              <p className="text-[10px] text-muted-foreground">☀️ Mornos</p>
              <p className="text-lg font-bold text-amber-600">{warmLeads}</p>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageLeads = getLeadsByStage(stage.key)
            return (
              <div key={stage.key} className={`min-w-[200px] max-w-[200px] rounded-xl border-2 ${stage.color} p-2 flex-shrink-0`}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                    <span>{stage.icon}</span> {stage.name}
                  </h3>
                  <span className="text-[10px] bg-white/80 rounded-full px-1.5 py-0.5 font-bold">{stageLeads.length}</span>
                </div>
                <div className="min-h-[250px] space-y-2">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-[10px] text-muted-foreground">—</p>
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div key={lead.id} className="bg-white rounded-lg border shadow-sm p-2.5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium truncate flex-1">{lead.name || lead.phone}</p>
                          <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${scoreColor(lead.score)}`}>
                            {lead.score}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{lead.phone}</p>
                        {lead.lastMessage && (
                          <p className="text-[10px] text-muted-foreground truncate mt-1 italic">
                            "{lead.lastMessage.substring(0, 40)}"
                          </p>
                        )}
                        {lead.nextAction && (
                          <p className="text-[10px] text-emerald-700 mt-1 truncate">
                            → {lead.nextAction.substring(0, 35)}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[9px] text-muted-foreground">
                            {lead.origin === "whatsapp" ? "📱" : "🌐"} {new Date(lead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                          </span>
                          <button 
                            onClick={() => window.location.href = "/sdr/conversas"}
                            className="text-[9px] text-blue-600 hover:underline"
                          >
                            💬 Ver
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
