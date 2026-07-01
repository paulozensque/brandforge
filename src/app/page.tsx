"use client"

import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"

const modules = [
  {
    title: "Análise da Empresa",
    description: "Diagnóstico de branding, posicionamento, oferta e plano de ação (The Futur + King Kong).",
    href: "/intel/empresa",
    icon: "🏢",
    color: "from-purple-500 to-indigo-600",
    status: "Ativo",
  },
  {
    title: "Análise de Mercado",
    description: "Mapeamento de concorrentes, público, oportunidades e estratégia de entrada.",
    href: "/intel/mercado",
    icon: "📊",
    color: "from-blue-500 to-cyan-600",
    status: "Ativo",
  },
  {
    title: "Produção de Conteúdo",
    description: "Posts, copies, scripts e calendário editorial com IA.",
    href: "/conteudo",
    icon: "✍️",
    color: "from-orange-500 to-amber-600",
    status: "Em breve",
  },
  {
    title: "Criativos & Campanhas",
    description: "Criativos para anúncios + estrutura Meta, Google e TikTok Ads.",
    href: "/campanhas",
    icon: "🚀",
    color: "from-green-500 to-emerald-600",
    status: "Em breve",
  },
  {
    title: "Zen SDR AI",
    description: "SDR inteligente no WhatsApp com CRM, qualificação e agendamento automático.",
    href: "/sdr/dashboard",
    icon: "🤖",
    color: "from-emerald-500 to-teal-600",
    status: "Em construção",
  },
  {
    title: "CRM Kanban",
    description: "Gestão visual de leads do primeiro contato ao fechamento.",
    href: "/sdr/crm",
    icon: "📋",
    color: "from-indigo-500 to-blue-600",
    status: "Em construção",
  },
]

export default function HomePage() {
  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">ECO</h1>
              <p className="text-sm text-muted-foreground">Estrutura Comercial Online <span className="font-medium">by ZEN POWER</span></p>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl">
            Sistema integrado de inteligência comercial, branding, conteúdo e vendas. 
            Tudo que sua empresa precisa para escalar de forma estruturada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <Link key={mod.href} href={mod.href} className="group">
              <div className="bg-card rounded-xl border p-6 h-full transition-all hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center`}>
                    <span className="text-2xl">{mod.icon}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    mod.status === "Ativo"
                      ? "bg-green-100 text-green-700"
                      : mod.status === "Em construção"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {mod.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1 group-hover:text-emerald-600 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-sm text-muted-foreground">{mod.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
