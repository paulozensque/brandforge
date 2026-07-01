import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Badge {
  id: string
  name: string
  icon: string
  description: string
  unlockedAt?: string
}

interface Mission {
  id: string
  title: string
  description: string
  xp: number
  completed: boolean
  module: string
}

interface GamificationStore {
  xp: number
  level: number
  streak: number
  lastActiveDate: string | null
  badges: Badge[]
  completedMissions: string[]
  dailyMissions: Mission[]

  addXP: (amount: number, reason: string) => void
  unlockBadge: (badge: Badge) => void
  completeMission: (missionId: string) => void
  checkStreak: () => void
  getDailyMissions: () => Mission[]
}

const LEVELS = [
  { level: 1, name: "Iniciante", xpNeeded: 0 },
  { level: 2, name: "Explorador", xpNeeded: 100 },
  { level: 3, name: "Estrategista", xpNeeded: 300 },
  { level: 4, name: "Executor", xpNeeded: 600 },
  { level: 5, name: "Pro", xpNeeded: 1000 },
  { level: 6, name: "Expert", xpNeeded: 1500 },
  { level: 7, name: "Master", xpNeeded: 2500 },
  { level: 8, name: "Legend", xpNeeded: 4000 },
  { level: 9, name: "Zen Master", xpNeeded: 6000 },
  { level: 10, name: "Zen Power 🏆", xpNeeded: 10000 },
]

export const ALL_BADGES: Badge[] = [
  { id: "first_login", name: "Primeiro Acesso", icon: "🌱", description: "Fez login pela primeira vez" },
  { id: "profile_complete", name: "Perfil Completo", icon: "📋", description: "Completou 100% do perfil da empresa" },
  { id: "first_analysis", name: "Primeira Análise", icon: "🔍", description: "Gerou primeira análise de empresa" },
  { id: "market_analyst", name: "Analista de Mercado", icon: "📊", description: "Gerou análise de mercado" },
  { id: "content_creator", name: "Criador", icon: "✍️", description: "Gerou primeiro conteúdo" },
  { id: "ad_launcher", name: "Lançador", icon: "🚀", description: "Criou primeira campanha" },
  { id: "prospector", name: "Prospector", icon: "🎯", description: "Fez 10 prospecções" },
  { id: "sdr_active", name: "SDR Ativo", icon: "🤖", description: "Conectou WhatsApp e ativou SDR" },
  { id: "first_lead", name: "Primeiro Lead", icon: "👤", description: "Recebeu primeiro lead no CRM" },
  { id: "five_leads", name: "5 Leads", icon: "⭐", description: "Recebeu 5 leads" },
  { id: "first_meeting", name: "Reunião!", icon: "📅", description: "Agendou primeira reunião" },
  { id: "streak_3", name: "3 Dias Seguidos", icon: "🔥", description: "Usou o sistema 3 dias seguidos" },
  { id: "streak_7", name: "Semana Inteira", icon: "💪", description: "7 dias seguidos de uso" },
  { id: "streak_30", name: "Mês Completo", icon: "💎", description: "30 dias seguidos" },
  { id: "level_5", name: "Nível Pro", icon: "🏅", description: "Chegou ao nível 5" },
  { id: "level_10", name: "Zen Power", icon: "🏆", description: "Nível máximo alcançado!" },
]

function calculateLevel(xp: number): number {
  let level = 1
  for (const l of LEVELS) {
    if (xp >= l.xpNeeded) level = l.level
  }
  return level
}

export function getLevelInfo(level: number) {
  return LEVELS.find((l) => l.level === level) || LEVELS[0]
}

export function getNextLevelXP(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP)
  const next = LEVELS.find((l) => l.level === currentLevel + 1)
  return next?.xpNeeded || currentXP
}

export function getXPProgress(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP)
  const currentLevelXP = LEVELS.find((l) => l.level === currentLevel)?.xpNeeded || 0
  const nextLevelXP = LEVELS.find((l) => l.level === currentLevel + 1)?.xpNeeded || currentXP
  const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  return Math.min(progress, 100)
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      badges: [{ id: "first_login", name: "Primeiro Acesso", icon: "🌱", description: "Fez login pela primeira vez", unlockedAt: new Date().toISOString() }],
      completedMissions: [],
      dailyMissions: [],

      addXP: (amount, reason) => {
        set((state) => {
          const newXP = state.xp + amount
          const newLevel = calculateLevel(newXP)
          return { xp: newXP, level: newLevel }
        })
      },

      unlockBadge: (badge) => {
        set((state) => {
          if (state.badges.find((b) => b.id === badge.id)) return state
          return { badges: [...state.badges, { ...badge, unlockedAt: new Date().toISOString() }] }
        })
      },

      completeMission: (missionId) => {
        set((state) => {
          if (state.completedMissions.includes(missionId)) return state
          const mission = state.dailyMissions.find((m) => m.id === missionId)
          const xpGain = mission?.xp || 10
          const newXP = state.xp + xpGain
          return {
            completedMissions: [...state.completedMissions, missionId],
            xp: newXP,
            level: calculateLevel(newXP),
            dailyMissions: state.dailyMissions.map((m) =>
              m.id === missionId ? { ...m, completed: true } : m
            ),
          }
        })
      },

      checkStreak: () => {
        const today = new Date().toISOString().split("T")[0]
        set((state) => {
          if (state.lastActiveDate === today) return state
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
          const newStreak = state.lastActiveDate === yesterday ? state.streak + 1 : 1
          return { streak: newStreak, lastActiveDate: today }
        })
      },

      getDailyMissions: () => {
        const missions: Mission[] = [
          { id: "daily_login", title: "Acessar o sistema", description: "Faça login hoje", xp: 5, completed: false, module: "geral" },
          { id: "daily_content", title: "Gerar 1 conteúdo", description: "Crie um post ou criativo", xp: 15, completed: false, module: "conteudo" },
          { id: "daily_prospect", title: "Prospectar 5 contatos", description: "Faça 5 abordagens", xp: 20, completed: false, module: "prospeccao" },
          { id: "daily_crm", title: "Atualizar CRM", description: "Mova pelo menos 1 lead de etapa", xp: 10, completed: false, module: "crm" },
          { id: "daily_profile", title: "Completar perfil", description: "Preencha mais 1 campo do perfil", xp: 10, completed: false, module: "perfil" },
        ]
        return missions
      },
    }),
    { name: "eco-gamification" }
  )
)
