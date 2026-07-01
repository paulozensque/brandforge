"use client"

import { AppShell } from "@/components/layout/app-shell"

const stages = [
  { name: "Novo Lead", color: "border-blue-300 bg-blue-50", count: 0 },
  { name: "Em Atendimento", color: "border-amber-300 bg-amber-50", count: 0 },
  { name: "Qualificado", color: "border-green-300 bg-green-50", count: 0 },
  { name: "Reunião Sugerida", color: "border-purple-300 bg-purple-50", count: 0 },
  { name: "Reunião Agendada", color: "border-indigo-300 bg-indigo-50", count: 0 },
  { name: "Proposta Enviada", color: "border-orange-300 bg-orange-50", count: 0 },
  { name: "Negociação", color: "border-pink-300 bg-pink-50", count: 0 },
  { name: "Fechado Ganho", color: "border-emerald-300 bg-emerald-50", count: 0 },
  { name: "Fechado Perdido", color: "border-red-300 bg-red-50", count: 0 },
]

export default function CRMPage() {
  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CRM Kanban</h1>
            <p className="text-muted-foreground mt-1">Visualize a evolução dos seus leads.</p>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div key={stage.name} className={`min-w-[220px] rounded-xl border-2 ${stage.color} p-3 flex-shrink-0`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider">{stage.name}</h3>
                <span className="text-xs bg-white/80 rounded-full px-2 py-0.5 font-medium">{stage.count}</span>
              </div>
              <div className="min-h-[300px] space-y-2">
                {/* Cards will go here */}
                <div className="text-center py-8">
                  <p className="text-xs text-muted-foreground">Vazio</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-card rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Info:</strong> O CRM será populado automaticamente quando o SDR IA começar a atender leads. 
            Cada lead terá: nome, telefone, empresa, score (0-100), classificação (frio/morno/quente), histórico de conversa e próxima ação.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
