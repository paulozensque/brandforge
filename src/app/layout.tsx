import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthSessionProvider } from "@/components/providers/session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ECO - Estrutura Comercial Online | by ZEN POWER",
  description: "Sistema integrado de inteligência comercial, branding, conteúdo e vendas com IA. Zen SDR AI, CRM, Campanhas e mais.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthSessionProvider>
          <div className="min-h-screen bg-background">{children}</div>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
