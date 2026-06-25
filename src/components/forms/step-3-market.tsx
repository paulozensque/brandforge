"use client"

import { useIntakeStore } from "@/lib/store/intake-store"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { TagInput } from "./tag-input"

export function Step3Market() {
  const { formData, updateFormData, nextStep, prevStep } = useIntakeStore()
  const handleNext = () => { if (!formData.targetAudience || formData.targetAudience.length < 10) { alert("Descreva seu publico-alvo (min 10 chars)"); return }; nextStep() }

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">Mercado & Publico</h2><p className="text-muted-foreground mt-1">Entender seu mercado e publico.</p></div>
      <div className="grid gap-5">
        <Textarea label="Publico-Alvo *" placeholder="Quem e seu cliente ideal?" value={formData.targetAudience || ""} onChange={(e) => updateFormData({ targetAudience: e.target.value })} rows={4} />
        <TagInput label="Principais Concorrentes" value={formData.mainCompetitors || []} onChange={(tags) => updateFormData({ mainCompetitors: tags })} placeholder="Nome do concorrente + Enter" maxTags={5} />
        <Textarea label="Posicao no Mercado" placeholder="Como voce se posiciona?" value={formData.marketPosition || ""} onChange={(e) => updateFormData({ marketPosition: e.target.value })} rows={2} />
        <div className="space-y-2">
          <label className="text-sm font-medium">Faixa de Preco</label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.priceRange || ""} onChange={(e) => updateFormData({ priceRange: e.target.value })}>
            <option value="">Selecione...</option>
            <option value="Economico">Economico</option>
            <option value="Custo-beneficio">Custo-beneficio</option>
            <option value="Premium">Premium</option>
            <option value="Luxo">Luxo</option>
          </select>
        </div>
      </div>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>Voltar</Button>
        <Button onClick={handleNext} size="lg">Proximo Passo</Button>
      </div>
    </div>
  )
}
