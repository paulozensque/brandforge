"use client"

import { AppShell } from "@/components/layout/app-shell"

export default function ConversasPage() {
  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Conversas</h1>
          <p className="text-muted-foreground mt-1">Histórico completo de atendimentos do SDR IA.</p>
        </div>

        <div className="bg-card rounded-xl border p-12 text-center">
          <span className="text-5xl block mb-4">🗨️</span>
          <h3 className="text-xl font-semibold mb-2">Nenhuma conversa ainda</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Quando o SDR IA começar a atender leads no WhatsApp, todas as conversas aparecerão aqui com histórico completo, scoring e classificação.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
