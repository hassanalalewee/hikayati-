import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

export const AI_MODELS = {
  // Groq models (active)
  GROQ_LARGE: 'llama-3.3-70b-versatile',
  GROQ_FAST: 'llama-3.3-70b-versatile',
  // OpenAI (kept for DALL-E images)
  GPT4O: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini',
  DALLE3: 'dall-e-3',
} as const
