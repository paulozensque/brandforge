"use client"

import { AppShell } from "@/components/layout/app-shell"

export default function SDRDashboardPage() {
  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Zen SDR AI</h1>
          <p className="text-muted-foreground mt-1">Dashboard de vendas e atendimento inteligente.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total de Leads", value: "0", color: "bg-blue-50 text-blue-700" },
            { label: "Leads Quentes", value: "0", color: "bg-red-50 text-red-700" },
            { label: "Reuniões Agendadas", value: "0", color: "bg-green-50 text-green-700" },
            { label: "Conversas Ativas", value: "0", color: "bg-amber-50 text-amber-700" },
          ].map((metric) => (
            <div key={metric.label} className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className={`text-3xl font-bold mt-1 ${metric.color.split(" ")[1]}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Leads Frios", value: "0", color: "text-blue-500" },
            { label: "Leads Mornos", value: "0", color: "text-amber-500" },
            { label: "Taxa Qualificação", value: "0%", color: "text-emerald-600" },
            { label: "Taxa Agendamento", value: "0%", color: "text-purple-600" },
          ].map((metric) => (
            <div key={metric.label} className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className={`text-2xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border p-6">
            <h3 className="font-semibold mb-3">💬 WhatsApp</h3>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span className="text-sm text-muted-foreground">Desconectado</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Conecte seu WhatsApp para começar a atender leads.</p>
          </div>

          <div className="bg-card rounded-xl border p-6">
            <h3 className="font-semibold mb-3">🤖 SDR IA</h3>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <span className="text-sm text-muted-foreground">Aguardando configuração</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Configure o perfil da empresa para ativar o SDR.</p>
          </div>
        </div>

        {/* Recent conversations placeholder */}
        <div className="mt-8 bg-card rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Últimas Conversas</h3>
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-4xl block mb-2">🗨️</span>
            <p>Nenhuma conversa ainda.</p>
            <p className="text-xs mt-1">Conecte o WhatsApp e comece a receber leads.</p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
