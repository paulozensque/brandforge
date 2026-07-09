/**
 * HeyGen API Client (preparado para uso futuro)
 * Docs: https://docs.heygen.com/reference
 * 
 * Para ativar:
 * 1. Adicione HEYGEN_API_KEY nas variáveis de ambiente
 * 2. Altere VIDEO_PROVIDER para "heygen" no .env
 * 
 * Fluxo HeyGen:
 * 1. Upload de foto → cria avatar personalizado
 * 2. Upload de áudio → clona voz
 * 3. Gera vídeo com avatar + roteiro usando voz clonada
 */

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || ""
const HEYGEN_BASE_URL = "https://api.heygen.com"

export function isHeyGenConfigured(): boolean {
  return !!HEYGEN_API_KEY
}

// Create a talking avatar video with HeyGen
export async function createHeyGenVideo(params: {
  avatarId?: string        // HeyGen avatar ID (or use photo upload)
  photoUrl?: string        // URL of face photo for instant avatar
  script: string           // Text to speak
  voiceId?: string         // HeyGen voice ID (or default pt-BR)
  audioUrl?: string        // Custom audio URL for voice cloning
}): Promise<{ success: boolean; videoId?: string; videoUrl?: string; error?: string }> {
  if (!HEYGEN_API_KEY) {
    return { success: false, error: "HeyGen API key não configurada" }
  }

  try {
    const body: any = {
      video_inputs: [{
        character: params.avatarId 
          ? { type: "avatar", avatar_id: params.avatarId }
          : { type: "talking_photo", talking_photo_url: params.photoUrl },
        voice: params.audioUrl
          ? { type: "audio", audio_url: params.audioUrl }
          : { type: "text", input_text: params.script, voice_id: params.voiceId || "pt_br_male" },
      }],
      dimension: { width: 1080, height: 1920 }, // Vertical video (Reels/TikTok)
    }

    const res = await fetch(`${HEYGEN_BASE_URL}/v2/video/generate`, {
      method: "POST",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { success: false, error: err?.message || `HeyGen error: ${res.status}` }
    }

    const data = await res.json()
    return { success: true, videoId: data.data?.video_id }
  } catch (error: any) {
    return { success: false, error: error?.message }
  }
}

// Check video status
export async function getHeyGenVideoStatus(videoId: string): Promise<{ 
  status: string; videoUrl?: string; error?: string 
}> {
  if (!HEYGEN_API_KEY) return { status: "error", error: "Not configured" }

  try {
    const res = await fetch(`${HEYGEN_BASE_URL}/v1/video_status.get?video_id=${videoId}`, {
      headers: { "X-Api-Key": HEYGEN_API_KEY },
    })

    if (!res.ok) return { status: "error", error: `Status check failed: ${res.status}` }

    const data = await res.json()
    return {
      status: data.data?.status || "processing",
      videoUrl: data.data?.video_url,
    }
  } catch (error: any) {
    return { status: "error", error: error?.message }
  }
}

// Clone voice from audio sample
export async function cloneVoiceHeyGen(audioUrl: string, voiceName: string): Promise<{
  success: boolean; voiceId?: string; error?: string
}> {
  if (!HEYGEN_API_KEY) return { success: false, error: "Not configured" }

  try {
    const res = await fetch(`${HEYGEN_BASE_URL}/v1/voice/clone`, {
      method: "POST",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        voice_name: voiceName,
      }),
    })

    if (!res.ok) return { success: false, error: `Clone failed: ${res.status}` }

    const data = await res.json()
    return { success: true, voiceId: data.data?.voice_id }
  } catch (error: any) {
    return { success: false, error: error?.message }
  }
}

// List available voices (pt-BR)
export async function listHeyGenVoices(): Promise<any[]> {
  if (!HEYGEN_API_KEY) return []

  try {
    const res = await fetch(`${HEYGEN_BASE_URL}/v1/voices`, {
      headers: { "X-Api-Key": HEYGEN_API_KEY },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.data?.voices || []).filter((v: any) => 
      v.language?.includes("Portuguese") || v.language?.includes("pt")
    )
  } catch {
    return []
  }
}
