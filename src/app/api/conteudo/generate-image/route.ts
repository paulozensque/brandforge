import { NextRequest, NextResponse } from "next/server"
import { generateImage } from "@/lib/ai/image-generator"

export async function POST(req: NextRequest) {
  try {
    const { prompt, size, style } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt obrigatório" }, { status: 400 })
    }

    const result = await generateImage(prompt, {
      size: size || "1024x1024",
      style: style || "vivid",
    })

    if (!result) {
      return NextResponse.json({
        generated: false,
        prompt,
        message: "Para gerar imagens com IA, adicione sua OPENAI_IMAGE_KEY no .env (necessita API key da OpenAI com acesso ao DALL-E 3). Copie o prompt abaixo e use no Midjourney, DALL-E ou Leonardo AI.",
      })
    }

    return NextResponse.json({
      generated: true,
      url: result.url,
      prompt: result.prompt,
      revised_prompt: result.revised_prompt,
    })
  } catch (error) {
    console.error("Image generation error:", error)
    return NextResponse.json({ error: "Erro ao gerar imagem" }, { status: 500 })
  }
}
