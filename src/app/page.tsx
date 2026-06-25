"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-brand" />
            <span className="text-xl font-bold">BrandForge</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard"><Button variant="ghost">Dashboard</Button></Link>
            <Link href="/intake"><Button>Criar Marca</Button></Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-6 py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              Powered by AI
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Transforme sua empresa em uma <span className="gradient-text">marca poderosa</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Preencha as informacoes da sua empresa e receba um relatorio completo de branding com arquetipos, posicionamento, voz da marca, identidade visual e plano de acao estrategico.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/intake"><Button size="xl" className="gradient-brand text-white hover:opacity-90">Comecar Agora (Gratis)</Button></Link>
              <Link href="/dashboard"><Button size="xl" variant="outline">Ver Dashboard</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>BrandForge - Sistema de Inteligencia de Marca</p>
          <p className="mt-1">Parte do ecossistema de 5 SaaS integrados</p>
        </div>
      </footer>
    </div>
  )
}
