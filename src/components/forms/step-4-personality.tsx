"use client"

import { useIntakeStore } from "@/lib/store/intake-store"
import { Button } from "@/components/ui/button"
import { TagInput } from "./tag-input"

const toneSuggestions = ["Profissional","Descontraido","Inspirador","Educativo","Provocador","Acolhedor","Ousado","Sofisticado","Divertido","Direto"]
const keywordSuggestions = ["Resultado","Transformacao","Crescimento","Facilidade","Inovacao","Velocidade","Qualidade","Confianca","Liberdade","Poder"]

export function Step4Personality() {
  const { formData, updateFormData, nextStep, prevStep } = useIntakeStore()
  const handleNext = () => { if (!formData.brandTone?.length) { alert("Selecione pelo menos 1 tom"); return }; if (!formData.brandKeywords || formData.brandKeywords.length < 3) { alert("Adicione pelo menos 3 palavras-chave"); return }; nextStep() }

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">Personalidade da Marca</h2><p className="text-muted-foreground mt-1">Se sua marca fosse uma pessoa, como ela seria?</p></div>
      <div className="grid gap-5">
        <TagInput label="Tom de Voz *" value={formData.brandTone || []} onChange={(tags) => updateFormData({ brandTone: tags })} suggestions={toneSuggestions} maxTags={5} />
        <TagInput label="Palavras-Chave da Marca *" value={formData.brandKeywords || []} onChange={(tags) => updateFormData({ brandKeywords: tags })} suggestions={keywordSuggestions} maxTags={8} />
        <TagInput label="Marcas de Inspiracao" value={formData.inspirations || []} onChange={(tags) => updateFormData({ inspirations: tags })} placeholder="Ex: Apple, Nike, Nubank..." maxTags={5} />
        <TagInput label="Palavras para EVITAR" value={formData.avoidWords || []} onChange={(tags) => updateFormData({ avoidWords: tags })} placeholder="Ex: barato, generico..." maxTags={5} />
      </div>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>Voltar</Button>
        <Button onClick={handleNext} size="lg">Proximo Passo</Button>
      </div>
    </div>
  )
}
