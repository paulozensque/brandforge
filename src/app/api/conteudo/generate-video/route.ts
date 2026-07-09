import { NextRequest, NextResponse } from "next/server"
import { createTalkingVideo, getTalkStatus, isDIDConfigured, uploadImageToDID } from "@/lib/ai/video-generator"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { script, imageUrl, imageBase64, voiceId, action, talkId } = body

    // Poll status of existing talk
    if (action === "status" && talkId) {
      const status = await getTalkStatus(talkId)
      return NextResponse.json(status)
    }

    // Check if D-ID is configured
    if (!isDIDConfigured()) {
      return NextResponse.json({ 
        success: false, 
        error: "D-ID API não configurada. Adicione D_ID_API_KEY nas variáveis de ambiente.",
        configured: false,
      })
    }

    if (!script) {
      return NextResponse.json({ success: false, error: "Script é obrigatório" }, { status: 400 })
    }

    // Get image URL
    let sourceUrl = imageUrl
    if (!sourceUrl && imageBase64) {
      sourceUrl = await uploadImageToDID(imageBase64)
      if (!sourceUrl) {
        return NextResponse.json({ 
          success: false, 
          error: "Erro ao fazer upload da imagem. Verifique se a foto tem um rosto visível (JPEG/PNG)." 
        }, { status: 500 })
      }
    }

    if (!sourceUrl) {
      return NextResponse.json({ success: false, error: "Imagem é obrigatória" }, { status: 400 })
    }

    // Create the talk (fast, returns immediately with talkId)
    const talk = await createTalkingVideo({
      sourceImageUrl: sourceUrl,
      script,
      voiceId,
    })

    if (talk.status === "error") {
      return NextResponse.json({ success: false, error: talk.error })
    }

    // Return talkId for frontend polling (don't wait for completion)
    return NextResponse.json({ 
      success: true, 
      talkId: talk.id, 
      status: "processing",
      message: "Vídeo em processamento. Aguarde..." 
    })
  } catch (error: any) {
    console.error("Video generation error:", error?.message)
    return NextResponse.json({ success: false, error: error?.message || "Erro interno" }, { status: 500 })
  }
}
