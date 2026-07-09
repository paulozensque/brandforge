/**
 * Video Provider - Abstraction layer for video generation
 * 
 * Currently uses: D-ID (default)
 * Future: HeyGen (when HEYGEN_API_KEY is set and VIDEO_PROVIDER=heygen)
 * 
 * To switch to HeyGen:
 * 1. Add HEYGEN_API_KEY to environment variables
 * 2. Set VIDEO_PROVIDER=heygen in environment variables
 */

import { isDIDConfigured } from "./video-generator"
import { isHeyGenConfigured } from "./heygen-client"

export type VideoProvider = "d-id" | "heygen"

export function getActiveProvider(): VideoProvider {
  const preferred = process.env.VIDEO_PROVIDER as VideoProvider
  
  if (preferred === "heygen" && isHeyGenConfigured()) return "heygen"
  if (isDIDConfigured()) return "d-id"
  
  return "d-id" // default
}

export function getProviderName(): string {
  const provider = getActiveProvider()
  return provider === "heygen" ? "HeyGen" : "D-ID"
}

export function isVideoGenerationAvailable(): boolean {
  return isDIDConfigured() || isHeyGenConfigured()
}
