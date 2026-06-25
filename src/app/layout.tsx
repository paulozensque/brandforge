import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BrandForge - Inteligencia de Marca com IA",
  description: "Transforme as informacoes da sua empresa em uma estrategia de marca poderosa com inteligencia artificial.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">{children}</div>
      </body>
    </html>
  )
}
