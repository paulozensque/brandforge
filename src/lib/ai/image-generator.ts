import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_IMAGE_KEY || process.env.OPENAI_API_KEY || "",
  baseURL: "https://api.openai.com/v1", // Always use OpenAI for images (not Ollama)
})

export interface GeneratedImage {
  url: string
  prompt: string
  revised_prompt?: string
}

export async function generateImage(prompt: string, options?: {
  size?: "1024x1024" | "1792x1024" | "1024x1792"
  quality?: "standard" | "hd"
  style?: "vivid" | "natural"
}): Promise<GeneratedImage | null> {
  const apiKey = process.env.OPENAI_IMAGE_KEY || process.env.OPENAI_API_KEY || ""
  
  // If no valid OpenAI key (ollama won't work for images), return null
  if (!apiKey || apiKey === "ollama" || !apiKey.startsWith("sk-")) {
    console.log("No valid OpenAI API key for image generation. Returning prompt only.")
    return null
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: options?.size || "1024x1024",
      quality: options?.quality || "standard",
      style: options?.style || "vivid",
    })

    return {
      url: response.data[0]?.url || "",
      prompt,
      revised_prompt: response.data[0]?.revised_prompt || "",
    }
  } catch (error: any) {
    console.error("Image generation error:", error?.message || error)
    return null
  }
}

export async function generateImageFromContent(
  contentDescription: string,
  brandContext: string,
  format: "post" | "ad" | "carousel_cover"
): Promise<GeneratedImage | null> {
  // Build a detailed prompt for the image
  const sizeMap = {
    post: "1024x1024" as const,
    ad: "1024x1792" as const, // Story/vertical format
    carousel_cover: "1024x1024" as const,
  }

  const stylePrompt = `Create a professional, high-quality ${format === "ad" ? "advertisement" : "social media"} visual.
Brand context: ${brandContext.substring(0, 200)}
Content: ${contentDescription.substring(0, 300)}
Style: Modern, clean, premium, eye-catching. No text in the image unless specifically requested.
Colors: Professional and aligned with the brand.`

  return generateImage(stylePrompt, { size: sizeMap[format] })
}
