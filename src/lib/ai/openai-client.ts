import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "ollama",
  baseURL: process.env.OPENAI_BASE_URL || "http://localhost:11434/v1",
})

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number
    maxTokens?: number
    model?: string
  }
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: options?.model || process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 4000,
  })

  return response.choices[0]?.message?.content || ""
}

export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number
    maxTokens?: number
    model?: string
  }
): Promise<T> {
  const response = await openai.chat.completions.create({
    model: options?.model || process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt + "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation." },
      { role: "user", content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.5,
    max_tokens: options?.maxTokens ?? 4000,
    response_format: { type: "json_object" },
  })

  const content = response.choices[0]?.message?.content || "{}"
  
  try {
    return JSON.parse(content) as T
  } catch {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as T
    }
    throw new Error("Failed to parse AI response as JSON")
  }
}
