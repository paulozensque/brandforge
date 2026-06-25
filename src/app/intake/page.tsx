"use client"

import { useIntakeStore } from "@/lib/store/intake-store"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Step1BasicInfo } from "@/components/forms/step-1-basic"
import { Step2Purpose } from "@/components/forms/step-2-purpose"
import { Step3Market } from "@/components/forms/step-3-market"
import { Step4Personality } from "@/components/forms/step-4-personality"
import { Step5Goals } from "@/components/forms/step-5-goals"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function IntakePage() {
  const { currentStep, totalSteps, formData, isSubmitting, setSubmitting, setReportId } = useIntakeStore()
  const router = useRouter()
  const progress = (currentStep / totalSteps) * 100

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/brand-report/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) })
      if (!response.ok) throw new Error("Failed")
      const data = await response.json()
      setReportId(data.reportId)
      router.push(`/report/${data.reportId}`)
    } catch (error) {
      alert("Erro ao gerar relatorio. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-background">
      <header className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg gradient-brand" /><span className="text-xl font-bold">BrandForge</span></Link>
          <div className="text-sm text-muted-foreground">Passo {currentStep} de {totalSteps}</div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="mb-8 space-y-3">
          <Progress value={progress} />
        </div>
        <div className="bg-card rounded-2xl border shadow-sm p-8">
          {currentStep === 1 && <Step1BasicInfo />}
          {currentStep === 2 && <Step2Purpose />}
          {currentStep === 3 && <Step3Market />}
          {currentStep === 4 && <Step4Personality />}
          {currentStep === 5 && <Step5Goals onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
        </div>
      </main>
    </div>
  )
}
