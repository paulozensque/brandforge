"use client"

import { useEffect, useState } from "react"
import { useGamificationStore, getLevelInfo, getXPProgress, getNextLevelXP } from "@/lib/store/gamification-store"

export function GamificationBar() {
  const { xp, level, streak, badges, checkStreak, addXP } = useGamificationStore()
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    checkStreak()
    // First login XP
    if (xp === 0) addXP(5, "first_login")
  }, [])

  const levelInfo = getLevelInfo(level)
  const progress = getXPProgress(xp)
  const nextXP = getNextLevelXP(xp)

  return (
    <>
      {/* Floating gamification button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
      >
        <div className="text-center">
          <span className="text-lg block leading-none">{levelInfo?.name === "Zen Power 🏆" ? "🏆" : `${level}`}</span>
          <span className="text-[8px] leading-none">LVL</span>
        </div>
      </button>

      {/* Panel */}
      {showPanel && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-card border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-white/70">Nível {level}</p>
                <p className="font-bold">{levelInfo?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{xp} XP</p>
                <p className="text-xs text-white/70">🔥 {streak} dia{streak !== 1 ? "s" : ""}</p>
              </div>
            </div>
            {/* XP Progress bar */}
            <div className="bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] text-white/60 mt-1">{xp} / {nextXP} XP para nível {level + 1}</p>
          </div>

          {/* Missions */}
          <div className="p-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Missões Diárias</h3>
            <div className="space-y-2">
              {[
                { icon: "✅", title: "Acessar o sistema", xp: 5, done: true },
                { icon: "✍️", title: "Gerar 1 conteúdo", xp: 15, done: false },
                { icon: "🎯", title: "Prospectar 5 contatos", xp: 20, done: false },
                { icon: "📋", title: "Atualizar CRM", xp: 10, done: false },
                { icon: "📝", title: "Completar perfil", xp: 10, done: false },
              ].map((m, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${m.done ? "bg-emerald-50" : "bg-accent/50"}`}>
                  <span className={m.done ? "opacity-50" : ""}>{m.icon}</span>
                  <span className={`flex-1 ${m.done ? "line-through text-muted-foreground" : ""}`}>{m.title}</span>
                  <span className={`font-medium ${m.done ? "text-emerald-600" : "text-violet-600"}`}>+{m.xp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="px-4 pb-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Conquistas ({badges.length}/16)</h3>
            <div className="flex flex-wrap gap-1">
              {badges.map((b) => (
                <span key={b.id} className="text-lg" title={b.name}>{b.icon}</span>
              ))}
              {Array.from({ length: Math.max(0, 8 - badges.length) }, (_, i) => (
                <span key={`locked-${i}`} className="text-lg opacity-20">🔒</span>
              ))}
            </div>
          </div>

          {/* XP Actions */}
          <div className="border-t p-3 bg-accent/30">
            <p className="text-[10px] text-muted-foreground text-center">
              Ganhe XP usando todos os módulos do ECO. Quanto mais você usa, mais rápido sobe de nível!
            </p>
          </div>
        </div>
      )}
    </>
  )
}
