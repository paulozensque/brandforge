"use client"

import { Sidebar } from "./sidebar"
import { GamificationBar } from "./gamification-bar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
      <GamificationBar />
    </div>
  )
}
