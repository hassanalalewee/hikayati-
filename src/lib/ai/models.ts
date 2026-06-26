import OpenAI from 'openai'
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions'

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

// Retry wrapper for Groq rate limit (429) errors with exponential backoff
export async function groqWithRetry(
  params: ChatCompletionCreateParamsNonStreaming,
  maxRetries = 4
) {
  let delay = 3000
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await groq.chat.completions.create(params)
    } catch (err: unknown) {
      const status = (err as { status?: number }).status
      const isRateLimit = status === 429
      if (!isRateLimit || attempt === maxRetries) throw err
      await new Promise(r => setTimeout(r, delay))
      delay = Math.min(delay * 2, 30000)
    }
  }
  // unreachable but satisfies TypeScript
  throw new Error('groqWithRetry: exhausted retries')
}
