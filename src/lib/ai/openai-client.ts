import OpenAI from "openai"

// In production (Vercel): use OpenAI API directly
// In development: use Ollama or OpenAI
const isProduction = process.env.NODE_ENV === "production"
const apiKey = isProduction
  ? (process.env.OPENAI_IMAGE_KEY || process.env.OPENAI_API_KEY || "")
  : (process.env.OPENAI_API_KEY || "ollama")
const baseURL = isProduction
  ? "https://api.openai.com/v1"
  : (process.env.OPENAI_BASE_URL || "http://localhost:11434/v1")
const defaultModel = isProduction
  ? "gpt-4o-mini"
  : (process.env.OPENAI_MODEL || "llama3.2")

const openai = new OpenAI({ apiKey, baseURL })

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
    model: options?.model || defaultModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2000,
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
    model: options?.model || defaultModel,
    messages: [
      { role: "system", content: systemPrompt + "\n\nRespond ONLY with valid JSON. No markdown, no code blocks, no extra text. Be concise." },
      { role: "user", content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.5,
    max_tokens: options?.maxTokens ?? 2000,
    response_format: { type: "json_object" },
  })

  const content = response.choices[0]?.message?.content || "{}"

  try {
    return JSON.parse(content) as T
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T
      } catch {}
    }
    console.error("Failed to parse JSON response:", content.slice(0, 200))
    return {} as T
  }
}
