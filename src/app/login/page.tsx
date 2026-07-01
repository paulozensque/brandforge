"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (mode === "register") {
      // Register first
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erro ao criar conta")
        setLoading(false)
        return
      }
    }

    // Login
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    if (result?.error) {
      setError(mode === "register" ? "Conta criada! Faça login." : "Email ou senha incorretos")
      if (mode === "register") setMode("login")
    } else {
      router.push("/")
    }
    setLoading(false)
  }

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-background">
      <div className="bg-card rounded-2xl border shadow-lg p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold">ECO</h1>
            <p className="text-xs text-muted-foreground">by ZEN POWER</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">
            {mode === "login" ? "Bem-vindo de volta" : "Criar conta"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Acesse sua Estrutura Comercial Online" : "Comece sua jornada no ECO"}
          </p>
        </div>

        {/* Google */}
        <Button onClick={handleGoogle} size="lg" variant="outline" className="w-full mb-4">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Entrar com Google
        </Button>

        {/* Divider */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">ou com email</span></div>
        </div>

        {/* Credentials form */}
        <form onSubmit={handleCredentials} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Seu nome"
                className="mt-1"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="seu@email.com"
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Senha</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder={mode === "register" ? "Mínimo 6 caracteres" : "Sua senha"}
              required
              className="mt-1"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
          )}

          <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
            {loading ? "Carregando..." : mode === "login" ? "Entrar" : "Criar Conta"}
          </Button>
        </form>

        {/* Toggle mode */}
        <div className="text-center mt-4">
          {mode === "login" ? (
            <p className="text-sm text-muted-foreground">
              Não tem conta?{" "}
              <button onClick={() => { setMode("register"); setError("") }} className="text-emerald-600 font-medium hover:underline">
                Criar conta grátis
              </button>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Já tem conta?{" "}
              <button onClick={() => { setMode("login"); setError("") }} className="text-emerald-600 font-medium hover:underline">
                Fazer login
              </button>
            </p>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Ao continuar, você concorda com os termos de uso da plataforma ECO by Zen Power.
        </p>
      </div>
    </div>
  )
}
