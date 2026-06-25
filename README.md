# BrandForge - SaaS 1: Inteligencia de Marca com IA

Sistema de branding automatizado que transforma informacoes da empresa em relatorios estrategicos usando IA.

## Parte do Ecossistema de 5 SaaS

1. **BrandForge (Este)** - Branding & identidade
2. Mercado & Vendas - Analise de mercado, personas, SWOT
3. Conteudo & Criativos - Geracao de conteudo
4. Ads Manager - Campanhas Meta/Google
5. SDR IA + CRM - Pre-atendimento e leads

## Setup

npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev

## Usando com Ollama (Gratuito)

No .env:
OPENAI_BASE_URL="http://localhost:11434/v1"
OPENAI_API_KEY="ollama"
OPENAI_MODEL="llama3.1"
