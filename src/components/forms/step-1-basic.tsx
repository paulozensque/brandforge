"use client"

import { useIntakeStore } from "@/lib/store/intake-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const industries = ["Tecnologia","Saude","Educacao","E-commerce","Alimentacao","Moda","Financas","Imoveis","Servicos","Consultoria","Marketing","Fitness","Beleza","Construcao","Automotivo","Entretenimento","Outro"]

export function Step1BasicInfo() {
  const { formData, updateFormData, nextStep } = useIntakeStore()
  const handleNext = () => { if (!formData.name || !formData.industry) { alert("Preencha o nome e a industria"); return }; nextStep() }

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">Informacoes Basicas</h2><p className="text-muted-foreground mt-1">Conte-nos sobre sua empresa.</p></div>
      <div className="grid gap-4">
        <Input label="Nome da Empresa *" placeholder="Ex: TechSolutions" value={formData.name || ""} onChange={(e) => updateFormData({ name: e.target.value })} />
        <div className="space-y-2">
          <label className="text-sm font-medium">Industria / Setor *</label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.industry || ""} onChange={(e) => updateFormData({ industry: e.target.value })}>
            <option value="">Selecione...</option>
            {industries.map((ind) => (<option key={ind} value={ind}>{ind}</option>))}
          </select>
        </div>
        <Input label="Segmento / Nicho" placeholder="Ex: SaaS B2B para pequenas empresas" value={formData.segment || ""} onChange={(e) => updateFormData({ segment: e.target.value })} />
        <Input label="Website" placeholder="https://suaempresa.com" value={formData.website || ""} onChange={(e) => updateFormData({ website: e.target.value })} />
        <Input label="Localizacao" placeholder="Ex: Sao Paulo, SP" value={formData.location || ""} onChange={(e) => updateFormData({ location: e.target.value })} />
      </div>
      <div className="flex justify-end pt-4"><Button onClick={handleNext} size="lg">Proximo Passo</Button></div>
    </div>
  )
}
