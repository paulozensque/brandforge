import { NextRequest, NextResponse } from "next/server"
import { generateTalkingHeadVideo, getTalkStatus, isDIDConfigured, uploadImageToDID, uploadAudioToDID } from "@/lib/ai/video-generator"

export const maxDuration = 120 // Allow up to 2 minutes for video generation

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { script, imageUrl, imageBase64, audioBase64, voiceId, action, talkId } = body

    // Check status of existing talk
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

    if (!script && !audioBase64) {
      return NextResponse.json({ success: false, error: "Script ou áudio é obrigatório" }, { status: 400 })
    }

    // Get image URL - either from direct URL or upload base64
    let sourceUrl = imageUrl
    if (!sourceUrl && imageBase64) {
      sourceUrl = await uploadImageToDID(imageBase64)
      if (!sourceUrl) {
        return NextResponse.json({ success: false, error: "Erro ao fazer upload da imagem" }, { status: 500 })
      }
    }

    if (!sourceUrl) {
      return NextResponse.json({ success: false, error: "Imagem é obrigatória (URL ou base64)" }, { status: 400 })
    }

    // Upload audio if provided (user's voice from video)
    let audioUrl: string | undefined
    if (audioBase64) {
      const uploaded = await uploadAudioToDID(audioBase64)
      if (uploaded) {
        audioUrl = uploaded
      } else {
        // Fallback to TTS if audio upload fails
        console.log("Audio upload failed, falling back to TTS")
      }
    }

    // Generate the video
    const result = await generateTalkingHeadVideo(sourceUrl, script || "", voiceId, audioUrl)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Video generation error:", error?.message)
    return NextResponse.json({ success: false, error: error?.message || "Erro interno" }, { status: 500 })
  }
}
