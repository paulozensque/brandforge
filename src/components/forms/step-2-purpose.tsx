"use client"

import { useIntakeStore } from "@/lib/store/intake-store"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { TagInput } from "./tag-input"

const valueSuggestions = ["Inovacao","Transparencia","Excelencia","Humanizacao","Agilidade","Qualidade","Colaboracao","Sustentabilidade","Simplicidade","Confianca"]
const differentialSuggestions = ["Atendimento personalizado","Tecnologia propria","Preco competitivo","Rapidez na entrega","Experiencia do time","Metodologia exclusiva"]

export function Step2Purpose() {
  const { formData, updateFormData, nextStep, prevStep } = useIntakeStore()
  const handleNext = () => { if (!formData.purpose || formData.purpose.length < 10) { alert("Descreva o proposito (min 10 chars)"); return }; if (!formData.values?.length) { alert("Adicione pelo menos 1 valor"); return }; nextStep() }

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">Proposito & Visao</h2><p className="text-muted-foreground mt-1">O proposito e a alma da marca.</p></div>
      <div className="grid gap-5">
        <Textarea label="Proposito da Empresa *" placeholder="Por que voce existe?" value={formData.purpose || ""} onChange={(e) => updateFormData({ purpose: e.target.value })} rows={3} />
        <Textarea label="Missao" placeholder="O que voce faz?" value={formData.mission || ""} onChange={(e) => updateFormData({ mission: e.target.value })} rows={2} />
        <Textarea label="Visao" placeholder="Onde quer chegar?" value={formData.vision || ""} onChange={(e) => updateFormData({ vision: e.target.value })} rows={2} />
        <TagInput label="Valores da Empresa *" value={formData.values || []} onChange={(tags) => updateFormData({ values: tags })} suggestions={valueSuggestions} maxTags={8} />
        <TagInput label="Diferenciais Competitivos *" value={formData.differentials || []} onChange={(tags) => updateFormData({ differentials: tags })} suggestions={differentialSuggestions} maxTags={6} />
      </div>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>Voltar</Button>
        <Button onClick={handleNext} size="lg">Proximo Passo</Button>
      </div>
    </div>
  )
}
