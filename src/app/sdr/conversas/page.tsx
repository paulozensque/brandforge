"use client"

import { useState, useEffect, useRef } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"

interface Conversation {
  id: string
  status: string
  createdAt: string
  updatedAt: string
  lead: {
    id: string
    name: string | null
    phone: string
    score: number
    classification: string
    status: string
    origin: string
  }
  messages: { id: string; role: string; content: string; createdAt: string }[]
}

export default function ConversasPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv)
      const interval = setInterval(() => fetchMessages(selectedConv), 5000)
      return () => clearInterval(interval)
    }
  }, [selectedConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/sdr/conversations")
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
        if (!selectedConv && data.length > 0) {
          setSelectedConv(data[0].id)
        }
      }
    } catch {}
    setLoading(false)
  }

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/sdr/conversations/${convId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch {}
  }

  const selectedConversation = conversations.find(c => c.id === selectedConv)

  const scoreColor = (score: number) => {
    if (score >= 61) return "text-red-600 bg-red-50"
    if (score >= 31) return "text-amber-600 bg-amber-50"
    return "text-blue-600 bg-blue-50"
  }

  const classificationLabel = (c: string) => {
    if (c === "HOT") return "🔥 Quente"
    if (c === "WARM") return "☀️ Morno"
    return "❄️ Frio"
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (mins < 1) return "agora"
    if (mins < 60) return `${mins}min`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  if (loading) {
    return (
      <AppShell>
        <div className="p-8 flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Carregando conversas...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - Lista de conversas */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold">💬 Conversas</h2>
            <p className="text-xs text-muted-foreground">{conversations.length} conversa(s)</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <span className="text-3xl block mb-2">💬</span>
                <p className="text-sm">Nenhuma conversa ainda.</p>
                <p className="text-xs mt-1">Mensagens recebidas no WhatsApp aparecerão aqui.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv.id)}
                  className={`w-full p-3 border-b text-left hover:bg-accent transition-all ${
                    selectedConv === conv.id ? "bg-accent border-l-2 border-l-emerald-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">
                        {conv.lead.classification === "HOT" ? "🔥" : conv.lead.classification === "WARM" ? "☀️" : "👤"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{conv.lead.name || conv.lead.phone}</p>
                        <span className="text-[10px] text-muted-foreground">{formatTime(conv.updatedAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.messages?.[0]?.content || "..."}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${scoreColor(conv.lead.score)}`}>
                          {conv.lead.score}/100
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          conv.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {conv.status === "ACTIVE" ? "Ativa" : "Finalizada"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {selectedConversation.lead.name || selectedConversation.lead.phone}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.lead.phone} • {classificationLabel(selectedConversation.lead.classification)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${scoreColor(selectedConversation.lead.score)}`}>
                    Score: {selectedConversation.lead.score}/100
                  </span>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = "/sdr/crm"}>
                    📋 Ver no CRM
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg, i) => (
                  <div key={msg.id || i} className={`flex ${msg.role === "USER" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.role === "USER" 
                        ? "bg-white border shadow-sm rounded-tl-sm" 
                        : "bg-emerald-500 text-white rounded-tr-sm"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.role === "USER" ? "text-muted-foreground" : "text-emerald-100"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Footer info */}
              <div className="p-3 border-t bg-card">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    🤖 SDR IA respondendo automaticamente • {messages.length} mensagens
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      ⏸️ Pausar IA
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      👤 Assumir conversa
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
              <div>
                <span className="text-5xl block mb-4">💬</span>
                <p className="text-lg font-medium">Selecione uma conversa</p>
                <p className="text-sm">Clique em uma conversa à esquerda para ver as mensagens.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
