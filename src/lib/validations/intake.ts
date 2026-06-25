import { z } from "zod"

export const step1Schema = z.object({
  name: z.string().min(2, "Nome da empresa obrigatorio"),
  industry: z.string().min(2, "Industria obrigatoria"),
  segment: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  foundedYear: z.number().optional(),
  teamSize: z.string().optional(),
  location: z.string().optional(),
})

export const step2Schema = z.object({
  mission: z.string().optional(),
  vision: z.string().optional(),
  purpose: z.string().min(10, "Descreva o proposito com pelo menos 10 caracteres"),
  values: z.array(z.string()).min(1, "Adicione pelo menos 1 valor"),
  differentials: z.array(z.string()).min(1, "Adicione pelo menos 1 diferencial"),
})

export const step3Schema = z.object({
  targetAudience: z.string().min(10, "Descreva seu publico-alvo"),
  mainCompetitors: z.array(z.string()),
  marketPosition: z.string().optional(),
  priceRange: z.string().optional(),
})

export const step4Schema = z.object({
  brandTone: z.array(z.string()).min(1, "Selecione pelo menos 1 tom"),
  brandKeywords: z.array(z.string()).min(3, "Adicione pelo menos 3 palavras-chave"),
  inspirations: z.array(z.string()),
  avoidWords: z.array(z.string()),
})

export const step5Schema = z.object({
  currentProblems: z.string().optional(),
  goals: z.string().min(10, "Descreva seus objetivos"),
  timeline: z.string().optional(),
})

export const fullIntakeSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type Step4Data = z.infer<typeof step4Schema>
export type Step5Data = z.infer<typeof step5Schema>
export type FullIntakeData = z.infer<typeof fullIntakeSchema>
