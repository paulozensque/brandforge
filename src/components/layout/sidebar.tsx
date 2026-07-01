"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    group: "Inteligência Comercial",
    items: [
      { href: "/intel/empresa", label: "Análise da Empresa", icon: "🏢" },
      { href: "/intel/mercado", label: "Análise do Mercado", icon: "📊" },
    ],
  },
  {
    group: "Conteúdo & Criativos",
    items: [
      { href: "/conteudo", label: "Produção de Conteúdo", icon: "✍️" },
      { href: "/criativos", label: "Criativos & Assets", icon: "🎨" },
    ],
  },
  {
    group: "Campanhas",
    items: [
      { href: "/campanhas", label: "Meta / Google / TikTok", icon: "🚀" },
    ],
  },
  {
    group: "Zen SDR AI",
    items: [
      { href: "/sdr/dashboard", label: "Dashboard", icon: "📈" },
      { href: "/sdr/whatsapp", label: "WhatsApp", icon: "💬" },
      { href: "/sdr/conversas", label: "Conversas", icon: "🗨️" },
      { href: "/sdr/crm", label: "CRM Kanban", icon: "📋" },
      { href: "/sdr/agenda", label: "Agendamento", icon: "📅" },
      { href: "/sdr/perfil-empresa", label: "Perfil da Empresa", icon: "🏛️" },
      { href: "/sdr/configuracoes", label: "Configurações IA", icon: "⚙️" },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-white/50 backdrop-blur-sm min-h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight">ECO</span>
            <span className="text-[10px] text-muted-foreground leading-tight">by ZEN POWER</span>
          </div>
        </Link>
        <p className="text-[10px] text-muted-foreground mb-6">Estrutura Comercial Online</p>

        <nav className="space-y-6">
          {navItems.map((group) => (
            <div key={group.group}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.group}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
