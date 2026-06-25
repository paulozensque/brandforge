import { create } from "zustand"
import type { FullIntakeData } from "@/lib/validations/intake"

interface IntakeStore {
  currentStep: number
  totalSteps: number
  formData: Partial<FullIntakeData>
  isSubmitting: boolean
  reportId: string | null

  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateFormData: (data: Partial<FullIntakeData>) => void
  setSubmitting: (value: boolean) => void
  setReportId: (id: string) => void
  reset: () => void
}

const initialFormData: Partial<FullIntakeData> = {
  name: "",
  industry: "",
  segment: "",
  website: "",
  teamSize: "",
  location: "",
  mission: "",
  vision: "",
  purpose: "",
  values: [],
  differentials: [],
  targetAudience: "",
  mainCompetitors: [],
  marketPosition: "",
  priceRange: "",
  brandTone: [],
  brandKeywords: [],
  inspirations: [],
  avoidWords: [],
  currentProblems: "",
  goals: "",
  timeline: "",
}

export const useIntakeStore = create<IntakeStore>((set) => ({
  currentStep: 1,
  totalSteps: 5,
  formData: initialFormData,
  isSubmitting: false,
  reportId: null,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, state.totalSteps) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  updateFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),
  setSubmitting: (value) => set({ isSubmitting: value }),
  setReportId: (id) => set({ reportId: id }),
  reset: () => set({ currentStep: 1, formData: initialFormData, isSubmitting: false, reportId: null }),
}))
