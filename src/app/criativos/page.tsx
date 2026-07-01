"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CriativosPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/conteudo")
  }, [router])
  return null
}
