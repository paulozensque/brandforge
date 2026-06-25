"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface TagInputProps {
  label?: string
  placeholder?: string
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  maxTags?: number
  error?: string
}

export function TagInput({ label, placeholder = "Digite e pressione Enter", value, onChange, suggestions = [], maxTags = 10, error }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !value.includes(trimmed) && value.length < maxTags) { onChange([...value, trimmed]) }
    setInputValue("")
  }

  const removeTag = (tagToRemove: string) => { onChange(value.filter((tag) => tag !== tagToRemove)) }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addTag(inputValue) }
    if (e.key === "Backspace" && !inputValue && value.length > 0) { removeTag(value[value.length - 1]) }
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex flex-wrap gap-2 p-2 rounded-md border bg-background min-h-[42px]">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-muted-foreground hover:text-foreground">x</button>
          </Badge>
        ))}
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={value.length === 0 ? placeholder : ""} className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground" />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.filter((s) => !value.includes(s)).map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => addTag(suggestion)} className="text-xs px-2 py-1 rounded-full border hover:bg-accent transition-colors">+ {suggestion}</button>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
