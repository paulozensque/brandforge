"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AgendaPage() {
  return (
    <AppShell>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Agendamento</h1>
          <p className="text-muted-foreground mt-1">Configure sua disponibilidade para reuniões.</p>
        </div>

        <div className="space-y-6">
          {/* Configuração de disponibilidade */}
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">📅 Disponibilidade</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duração padrão da reunião</label>
                <select className="w-full h-10 rounded-md border px-3 text-sm mt-1">
                  <option value="15">15 minutos</option>
                  <option value="30" selected>30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Responsável</label>
                <Input placeholder="Nome do responsável comercial" className="mt-1" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Dias disponíveis</label>
              <div className="flex gap-2">
                {["Seg", "Ter", "Qua", "Qui", "Sex"].map((day) => (
                  <button key={day} className="px-3 py-2 rounded-lg border bg-emerald-50 text-emerald-700 text-sm font-medium">
                    {day}
                  </button>
                ))}
                {["Sáb", "Dom"].map((day) => (
                  <button key={day} className="px-3 py-2 rounded-lg border bg-gray-50 text-gray-400 text-sm">
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Horário início</label>
                <Input type="time" defaultValue="09:00" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Horário fim</label>
                <Input type="time" defaultValue="18:00" className="mt-1" />
              </div>
            </div>

            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Salvar Disponibilidade
            </Button>
          </div>

          {/* Reuniões agendadas */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Próximas Reuniões</h2>
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl block mb-2">📅</span>
              <p>Nenhuma reunião agendada.</p>
              <p className="text-xs mt-1">Quando o SDR IA qualificar um lead, sugerirá horários automaticamente.</p>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Próxima versão:</strong> Integração com Google Calendar para sincronização automática.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
