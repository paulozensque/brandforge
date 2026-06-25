"use client"

import { useIntakeStore } from "@/lib/store/intake-store"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface Step5Props { onSubmit: () => void; isSubmitting: boolean }

export function Step5Goals({ onSubmit, isSubmitting }: Step5Props) {
  const { formData, updateFormData, prevStep } = useIntakeStore()
  const handleSubmit = () => { if (!formData.goals || formData.goals.length < 10) { alert("Descreva seus objetivos (min 10 chars)"); return }; onSubmit() }

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">Situacao Atual & Objetivos</h2></div>
      <div className="grid gap-5">
        <Textarea label="Problemas Atuais" placeholder="O que te incomoda na sua marca/empresa?" value={formData.currentProblems || ""} onChange={(e) => updateFormData({ currentProblems: e.target.value })} rows={4} />
        <Textarea label="Objetivos *" placeholder="O que quer conquistar?" value={formData.goals || ""} onChange={(e) => updateFormData({ goals: e.target.value })} rows={4} />
        <div className="space-y-2">
          <label className="text-sm font-medium">Prazo</label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.timeline || ""} onChange={(e) => updateFormData({ timeline: e.target.value })}>
            <option value="">Selecione...</option>
            <option value="Urgente (1-2 semanas)">Urgente (1-2 semanas)</option>
            <option value="Curto prazo (1-3 meses)">Curto prazo (1-3 meses)</option>
            <option value="Medio prazo (3-6 meses)">Medio prazo (3-6 meses)</option>
            <option value="Longo prazo (6-12 meses)">Longo prazo (6-12 meses)</option>
          </select>
        </div>
      </div>
      <div className="bg-purple-50 rounded-xl p-4 space-y-2">
        <h4 className="font-semibold text-sm">Sera gerado:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>- Analise de Arquetipo de Marca (Jung)</li>
          <li>- Golden Circle (Simon Sinek)</li>
          <li>- Posicionamento Estrategico (Al Ries)</li>
          <li>- Guia de Voz e Tom</li>
          <li>- Historia da Marca (StoryBrand)</li>
          <li>- Identidade Visual</li>
          <li>- Analise Competitiva (Blue Ocean)</li>
          <li>- Plano de Acao 90 dias</li>
        </ul>
      </div>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>Voltar</Button>
        <Button onClick={handleSubmit} size="lg" loading={isSubmitting} className="gradient-brand text-white">
          {isSubmitting ? "Gerando..." : "Gerar Relatorio de Branding"}
        </Button>
      </div>
    </div>
  )
}
