/**
 * D-ID API Integration for generating talking head videos
 * Docs: https://docs.d-id.com/reference
 * 
 * Flow:
 * 1. Upload source photo → get image URL
 * 2. Create a "talk" with photo + script text
 * 3. Poll for completion
 * 4. Return video URL
 */

const D_ID_API_KEY = process.env.D_ID_API_KEY || ""
const D_ID_BASE_URL = "https://api.d-id.com"

interface TalkRequest {
  sourceImageUrl: string  // URL of the face photo (or base64 data URI)
  script?: string          // Text the avatar will speak (if using TTS)
  audioUrl?: string       // URL of audio file (if using custom voice)
  voiceId?: string        // D-ID voice ID (optional, defaults to Brazilian Portuguese)
  language?: string       // Language code
}

interface TalkResult {
  id: string
  status: "created" | "started" | "done" | "error"
  resultUrl?: string
  error?: string
}

// Upload audio to D-ID
export async function uploadAudioToDID(audioBase64: string): Promise<string | null> {
  if (!D_ID_API_KEY) return null

  try {
    const matches = audioBase64.match(/^data:(.+);base64,(.+)$/)
    if (!matches) return null

    const contentType = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, "base64")

    const blob = new Blob([buffer], { type: contentType })
    const formData = new FormData()
    formData.append("audio", blob, "voice.mp3")

    const res = await fetch(`${D_ID_BASE_URL}/audios`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${D_ID_API_KEY}`,
      },
      body: formData,
    })

    if (!res.ok) {
      console.error("D-ID audio upload error:", res.status)
      return null
    }

    const data = await res.json()
    return data.url || null
  } catch (error: any) {
    console.error("D-ID audio upload error:", error?.message)
    return null
  }
}

// Upload image to D-ID
export async function uploadImageToDID(imageBase64: string): Promise<string | null> {
  if (!D_ID_API_KEY) return null

  try {
    // Extract the actual base64 data and content type
    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      console.error("Invalid base64 format")
      return null
    }

    const contentType = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, "base64")

    // D-ID requires multipart form-data for image upload
    const ext = contentType.includes("png") ? "png" : "jpg"
    const blob = new Blob([buffer], { type: contentType })
    const formData = new FormData()
    formData.append("image", blob, `photo.${ext}`)

    const res = await fetch(`${D_ID_BASE_URL}/images`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${D_ID_API_KEY}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      console.error("D-ID upload error:", res.status, errText)
      return null
    }

    const data = await res.json()
    return data.url || null
  } catch (error: any) {
    console.error("D-ID upload error:", error?.message)
    return null
  }
}

// Create a talking head video
export async function createTalkingVideo(request: TalkRequest): Promise<TalkResult> {
  if (!D_ID_API_KEY) {
    return { id: "", status: "error", error: "D-ID API key não configurada. Adicione D_ID_API_KEY nas variáveis de ambiente." }
  }

  try {
    const body: any = {
      source_url: request.sourceImageUrl,
      config: {
        fluent: true,
        pad_audio: 0.5,
      },
    }

    // Use audio URL if provided (custom voice from user's video)
    if (request.audioUrl) {
      body.script = {
        type: "audio",
        audio_url: request.audioUrl,
      }
    } else if (request.script) {
      // Use text-to-speech
      body.script = {
        type: "text",
        input: request.script,
        provider: {
          type: "microsoft",
          voice_id: request.voiceId || "pt-BR-AntonioNeural",
        },
      }
    } else {
      return { id: "", status: "error", error: "Script ou áudio é obrigatório" }
    }

    const res = await fetch(`${D_ID_BASE_URL}/talks`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${D_ID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error("D-ID create talk error:", res.status, errorData)
      return { 
        id: "", 
        status: "error", 
        error: `Erro ao criar vídeo: ${errorData?.message || errorData?.description || res.status}` 
      }
    }

    const data = await res.json()
    return { id: data.id, status: data.status || "created" }
  } catch (error: any) {
    console.error("D-ID create talk error:", error?.message)
    return { id: "", status: "error", error: error?.message || "Erro desconhecido" }
  }
}

// Check status of a talk
export async function getTalkStatus(talkId: string): Promise<TalkResult> {
  if (!D_ID_API_KEY || !talkId) {
    return { id: talkId, status: "error", error: "Configuração inválida" }
  }

  try {
    const res = await fetch(`${D_ID_BASE_URL}/talks/${talkId}`, {
      headers: {
        Authorization: `Basic ${D_ID_API_KEY}`,
      },
    })

    if (!res.ok) {
      return { id: talkId, status: "error", error: `Status check failed: ${res.status}` }
    }

    const data = await res.json()
    return {
      id: talkId,
      status: data.status || "started",
      resultUrl: data.result_url || data.resultUrl || undefined,
      error: data.error?.description || undefined,
    }
  } catch (error: any) {
    return { id: talkId, status: "error", error: error?.message }
  }
}

// Poll until video is ready (max 2 minutes)
export async function waitForVideo(talkId: string, maxWaitMs: number = 120000): Promise<TalkResult> {
  const startTime = Date.now()
  const pollInterval = 3000 // 3 seconds

  while (Date.now() - startTime < maxWaitMs) {
    const result = await getTalkStatus(talkId)
    
    if (result.status === "done" && result.resultUrl) {
      return result
    }
    
    if (result.status === "error") {
      return result
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  return { id: talkId, status: "error", error: "Timeout: vídeo demorou mais de 2 minutos para ser gerado" }
}

// Full flow: create video and wait for result
export async function generateTalkingHeadVideo(
  imageUrl: string,
  script: string,
  voiceId?: string,
  audioUrl?: string,
): Promise<{ success: boolean; videoUrl?: string; error?: string; talkId?: string }> {
  // Step 1: Create the talk
  const talk = await createTalkingVideo({
    sourceImageUrl: imageUrl,
    script: audioUrl ? undefined : script,
    audioUrl,
    voiceId,
  })

  if (talk.status === "error") {
    return { success: false, error: talk.error }
  }

  // Step 2: Wait for completion
  const result = await waitForVideo(talk.id)

  if (result.status === "done" && result.resultUrl) {
    return { success: true, videoUrl: result.resultUrl, talkId: talk.id }
  }

  return { success: false, error: result.error || "Falha ao gerar vídeo", talkId: talk.id }
}

// Get available D-ID voices for Brazilian Portuguese
export function getBrazilianVoices() {
  return [
    { id: "pt-BR-AntonioNeural", name: "Antonio (Masculino)", gender: "male" },
    { id: "pt-BR-FranciscaNeural", name: "Francisca (Feminino)", gender: "female" },
    { id: "pt-BR-ThalitaNeural", name: "Thalita (Feminino)", gender: "female" },
    { id: "pt-BR-BrendaNeural", name: "Brenda (Feminino)", gender: "female" },
    { id: "pt-BR-DonatoNeural", name: "Donato (Masculino)", gender: "male" },
    { id: "pt-BR-ElzaNeural", name: "Elza (Feminino)", gender: "female" },
    { id: "pt-BR-FabioNeural", name: "Fabio (Masculino)", gender: "male" },
    { id: "pt-BR-GiovannaNeural", name: "Giovanna (Feminino)", gender: "female" },
    { id: "pt-BR-HumbertoNeural", name: "Humberto (Masculino)", gender: "male" },
    { id: "pt-BR-LeticiaNeural", name: "Leticia (Feminino)", gender: "female" },
    { id: "pt-BR-ManuelaNeural", name: "Manuela (Feminino)", gender: "female" },
    { id: "pt-BR-NicolauNeural", name: "Nicolau (Masculino)", gender: "male" },
    { id: "pt-BR-ValerioNeural", name: "Valerio (Masculino)", gender: "male" },
    { id: "pt-BR-YaraNeural", name: "Yara (Feminino)", gender: "female" },
  ]
}

// Check if D-ID is configured
export function isDIDConfigured(): boolean {
  return !!D_ID_API_KEY
}
