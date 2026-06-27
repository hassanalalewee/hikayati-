# Hikayati — AI Service Layer Design v1.0
**Hidden Engine: Backend Utility Only**

> Status: APPROVED FOR IMPLEMENTATION
> Version: 1.0
> Date: 2026-06-27
> Depends on: 22_TECHNICAL_ARCHITECTURE_v2.0.md

---

## CORE RULE

AI is a backend utility. It has one job: produce a draft. A human decides what happens next.

**AI is never:**
- Visible to the customer
- The final authority on quality
- Referenced in any user-facing copy, error message, or status update
- A decision-maker in the workflow

**AI is always:**
- Called from server-side Inngest functions only (never from API routes directly)
- Budget-capped per call
- Retried at most once on failure
- Replaceable — the service layer is model-agnostic by design

---

## PART 1 — SERVICE LOCATION & STRUCTURE

```
lib/
└── ai/
    ├── index.ts              ← public API (only thing imported elsewhere)
    ├── story.ts              ← story draft generation
    ├── illustration.ts       ← illustration prompt generation
    ├── qa.ts                 ← quality assessment
    ├── assist.ts             ← editor AI assist actions
    ├── images.ts             ← DALL-E image generation + storage upload
    ├── prompts/
    │   ├── story.ts          ← story prompt templates by age group + dialect
    │   ├── qa.ts             ← QA prompt template
    │   └── assist.ts         ← assist action prompts
    └── _client.ts            ← Anthropic + OpenAI clients (internal only)
```

**Rule:** Nothing outside `lib/ai/` imports from `_client.ts` or any internal file directly. All callers import from `lib/ai/index.ts` only.

---

## PART 2 — PUBLIC API (`lib/ai/index.ts`)

Five functions. Nothing else is exported.

```typescript
// lib/ai/index.ts

export { generateStoryDraft }    // from story.ts
export { generateIllustrationPrompts }  // from illustration.ts
export { runQAReview }           // from qa.ts
export { runEditorAssist }       // from assist.ts
export { generateAndStoreImage } // from images.ts
```

### Function Signatures

```typescript
// 1. Story draft
generateStoryDraft(input: StoryInput): Promise<StoryDraftResult>

// 2. Illustration prompts
generateIllustrationPrompts(input: IllustrationInput): Promise<IllustrationResult>

// 3. QA review
runQAReview(input: QAInput): Promise<QAResult>

// 4. Editor assist (inline AI suggestions in editor dashboard)
runEditorAssist(input: AssistInput): Promise<AssistResult>

// 5. Image generation + immediate upload to Supabase Storage
generateAndStoreImage(input: ImageInput): Promise<ImageResult>
```

---

## PART 3 — INPUT / OUTPUT TYPES

```typescript
// ── Shared ────────────────────────────────────────────────────

type AgeGroup = '2-4' | '5-7' | '8-12'
type Dialect  = 'msa' | 'gulf' | 'levantine' | 'egyptian'

// ── Story Draft ───────────────────────────────────────────────

interface StoryInput {
  childName:      string       // max 30 chars, sanitized
  ageGroup:       AgeGroup
  personality:    string[]     // max 3 items, from approved enum
  storyGoal:      string       // from approved enum
  dialect:        Dialect
  specialNotes:   string | null  // max 500 chars, sanitized
  revisionBrief:  string | null  // editor's note on retry, max 1000 chars
  attemptNumber:  1 | 2        // 1 = first try, 2 = retry
}

interface StoryDraftResult {
  ok:         boolean
  title:      string | null
  content:    string | null    // full story in Arabic
  wordCount:  number | null
  tokensUsed: number | null
  modelUsed:  string | null
  error:      string | null    // internal error message, never shown to user
}

// ── Illustration Prompts ──────────────────────────────────────

interface IllustrationInput {
  storyContent: string
  childName:    string
  ageGroup:     AgeGroup
  dialect:      Dialect
}

interface IllustrationResult {
  ok:      boolean
  prompts: IllustrationPrompt[]
  error:   string | null
}

interface IllustrationPrompt {
  sceneIndex:  number          // 1–8
  promptText:  string          // English prompt for DALL-E
  styleNotes:  string          // cultural/visual guidance
}

// ── QA Review ─────────────────────────────────────────────────

interface QAInput {
  storyContent: string
  childName:    string
  ageGroup:     AgeGroup
  storyGoal:    string
  dialect:      Dialect
}

interface QAResult {
  ok:      boolean
  score:   number | null       // 0–100
  flags:   string[]            // issue descriptions, shown to editor only
  passed:  boolean | null      // score >= QA_THRESHOLD (80)
  error:   string | null
}

// ── Editor Assist ─────────────────────────────────────────────

type AssistAction =
  | 'regenerate_paragraph'
  | 'improve_arabic'
  | 'simplify_for_age'
  | 'soften_tone'
  | 'regenerate_full_draft'

interface AssistInput {
  action:       AssistAction
  targetText:   string         // selected text or full story
  ageGroup:     AgeGroup
  dialect:      Dialect
  childName:    string
  storyGoal:    string
}

interface AssistResult {
  ok:          boolean
  suggestion:  string | null   // suggested replacement text
  error:       string | null
}

// ── Image Generation ──────────────────────────────────────────

interface ImageInput {
  promptText:   string         // illustration prompt from generateIllustrationPrompts
  orderId:      string
  sceneIndex:   number         // 1–8, or 0 for cover
  styleNotes:   string
}

interface ImageResult {
  ok:           boolean
  storagePath:  string | null  // Supabase Storage path — permanent
  fileSizeBytes: number | null
  error:        string | null
}
```

---

## PART 4 — STORY PROMPT DESIGN

### Prompt Architecture

The story prompt is deterministic by construction:
- Structured input → structured prompt template → structured output
- No open-ended instructions that produce unpredictable length or format
- Output format explicitly requested in the prompt

### Story Prompt Template

```typescript
// lib/ai/prompts/story.ts

const WORD_TARGETS: Record<AgeGroup, { min: number; max: number }> = {
  '2-4': { min: 350, max: 500 },
  '5-7': { min: 650, max: 900 },
  '8-12': { min: 1000, max: 1400 },
}

const DIALECT_INSTRUCTIONS: Record<Dialect, string> = {
  msa:       'Write in Modern Standard Arabic (الفصحى المعاصرة). Clear, accessible MSA suitable for children.',
  gulf:      'Write in Gulf Arabic dialect (اللهجة الخليجية). Natural spoken Gulf register as used in Saudi Arabia, UAE, and Kuwait.',
  levantine: 'Write in Levantine Arabic dialect (اللهجة الشامية). Natural spoken Levantine as used in Lebanon, Syria, and Jordan.',
  egyptian:  'Write in Egyptian Arabic dialect (اللهجة المصرية). Natural spoken Egyptian register.',
}

export function buildStoryPrompt(input: StoryInput): string {
  const { min, max } = WORD_TARGETS[input.ageGroup]
  const dialectInstruction = DIALECT_INSTRUCTIONS[input.dialect]
  const revisionContext = input.revisionBrief
    ? `\n\nREVISION REQUEST FROM EDITOR:\n${input.revisionBrief}\nAddress this specifically in the new draft.`
    : ''

  return `You are a children's literature author writing in Arabic.

Write a personalized Arabic children's story with these exact specifications:

CHILD PROFILE:
- Name: ${input.childName}
- Age group: ${input.ageGroup} years old
- Personality: ${input.personality.join(', ')}
- Story goal / lesson: ${input.storyGoal}
${input.specialNotes ? `- Parent's notes: ${input.specialNotes}` : ''}

LANGUAGE:
${dialectInstruction}

LENGTH: Between ${min} and ${max} words. Do not exceed ${max} words.

STORY REQUIREMENTS:
1. ${input.childName} is the main character and the hero of the story
2. The story must organically deliver the lesson "${input.storyGoal}" — show it, do not state it
3. ${input.childName}'s personality traits must be visible in their actions and choices
4. The story must have a clear beginning, middle, and end
5. End with resolution — ${input.childName} feels empowered, understood, or has grown
6. Vocabulary and sentence complexity must be appropriate for age ${input.ageGroup}
7. The story must be suitable and safe for children — no fear, violence, or distressing content beyond age-appropriate challenge
${input.specialNotes ? `8. Incorporate the parent's notes naturally into the story` : ''}${revisionContext}

OUTPUT FORMAT — respond with valid JSON only, no other text:
{
  "title": "story title in Arabic",
  "content": "full story text in Arabic"
}`
}
```

### Why JSON Output

- Prevents markdown wrapping, preamble, or trailing commentary
- Allows reliable parsing without regex
- Title and content are separated cleanly
- If JSON parse fails → treat as generation failure → retry once

---

## PART 5 — QA PROMPT DESIGN

```typescript
// lib/ai/prompts/qa.ts

export function buildQAPrompt(input: QAInput): string {
  return `You are a quality reviewer for an Arabic children's publishing service.

Review the following story and score it from 0 to 100.

STORY METADATA:
- Child name: ${input.childName}
- Age group: ${input.ageGroup}
- Intended lesson: ${input.storyGoal}
- Dialect: ${input.dialect}

STORY TEXT:
${input.storyContent}

SCORING CRITERIA (each worth up to 20 points):
1. Language quality — correct grammar, natural flow, age-appropriate vocabulary
2. Cultural appropriateness — authentic Arabic context, no inappropriate cultural references
3. Emotional safety — nothing frightening, distressing, or confusing for a child of this age
4. Personalization quality — child's name and goal feel natural, not inserted mechanically
5. Narrative quality — clear arc, child is the hero, story is enjoyable to read aloud

OUTPUT FORMAT — respond with valid JSON only, no other text:
{
  "score": <number 0-100>,
  "flags": [<short description of any issue found, max 5 flags, empty array if none>]
}`
}
```

---

## PART 6 — COST CONTROL

### Per-Call Token Budgets

Hard limits enforced via the `max_tokens` API parameter. Calls that approach the limit are logged.

| Function | Model | Max Input Tokens | Max Output Tokens | Est. Cost/Call |
|---|---|---|---|---|
| `generateStoryDraft` (age 2–4) | claude-sonnet-4-6 | 800 | 700 | ~$0.006 |
| `generateStoryDraft` (age 5–7) | claude-sonnet-4-6 | 800 | 1,200 | ~$0.009 |
| `generateStoryDraft` (age 8–12) | claude-sonnet-4-6 | 800 | 1,800 | ~$0.013 |
| `generateIllustrationPrompts` | claude-haiku-4-5 | 2,000 | 600 | ~$0.001 |
| `runQAReview` | claude-haiku-4-5 | 2,500 | 200 | ~$0.001 |
| `runEditorAssist` (paragraph) | claude-haiku-4-5 | 1,000 | 400 | ~$0.001 |
| `runEditorAssist` (full draft) | claude-sonnet-4-6 | 2,500 | 1,800 | ~$0.013 |
| `generateAndStoreImage` × 7 | DALL-E 3 (1024×1024) | — | — | ~$0.28 |
| **Total per story (age 5–7, 7 images)** | | | | **~$0.30** |

### Cost Control Rules

**Rule 1 — Max tokens is a hard cap, not a target.**
Every API call sets `max_tokens` to the budget above. If the model hits the cap, the call is treated as a failure and retried once. A truncated story is not a valid story.

**Rule 2 — Use the right model for the job.**
- `claude-sonnet-4-6`: story drafts and full-draft AI assist only (quality-critical)
- `claude-haiku-4-5`: illustration prompts, QA review, paragraph-level assist (speed + cost)
- `dall-e-3` at `1024x1024` standard quality: illustrations (not HD — cost doubles, quality gain marginal for children's illustration style)

**Rule 3 — No retries on image generation.**
DALL-E image failures are logged and skipped gracefully. The story is delivered with a placeholder for any missing image. Image retry is a manual admin action. Reason: DALL-E failures are usually content policy rejections — retrying the same prompt produces the same rejection.

**Rule 4 — No streaming.**
All Claude calls use standard (non-streaming) completion. Streaming adds complexity and does not benefit a background job.

**Rule 5 — Per-order cost cap.**
If the running cost of an order exceeds $1.50 (5× expected), the Inngest function fails the job and alerts the engineering channel. This catches runaway retries or prompt injection attacks that inflate token usage.

**Rule 6 — No calls from API routes.**
All AI calls happen inside Inngest step functions only. This enforces async-only execution, prevents timeout issues, and keeps AI usage centralized and auditable.

---

## PART 7 — FAILURE HANDLING

### Retry Policy

```
Attempt 1 → failure?
    │
    ├── Retryable error (5xx, timeout, rate limit)?
    │       └── Wait 3 seconds → Attempt 2
    │                │
    │                └── failure? → Mark as failed, surface to editor queue
    │
    └── Non-retryable error (4xx, content policy, JSON parse fail)?
            └── Mark as failed immediately, no retry
```

**Retryable errors:**
- HTTP 500, 503 from Anthropic/OpenAI
- Network timeout
- Rate limit (429) — wait and retry once
- JSON parse failure on output (model produced non-JSON) — retry with reinforced JSON instruction

**Non-retryable errors:**
- Content policy rejection (OpenAI/Anthropic moderation block)
- Invalid API key
- Model not found
- Input validation failure (caught before API call)

### What Happens on Final Failure

The job does not silently fail. On final failure:

1. `orders.status` → `draft_ready` with `qa_flags` containing `['generation_failed']`
2. Order appears in editor queue with flag: "Draft generation failed — editor rewrite required"
3. Editor sees the child profile and parent notes — can write the story manually
4. `order_events` row inserted: `actor_type: 'system'`, `event_type: 'generation_failed'`
5. Engineering alert fired (Sentry + log)

**Customer never sees a failure state.** Their status page continues to show "Our team is preparing your story." The human editor is the fallback for every AI failure.

### Error Logging

```typescript
// Internal error shape — never serialized to API responses
interface AIError {
  function:    string          // which AI function failed
  orderId:     string
  attempt:     number
  errorCode:   string
  errorMessage: string
  tokensUsed:  number | null
  durationMs:  number
  timestamp:   string
}
```

All AI errors are logged to Sentry with `orderId` tag for traceability. No user PII (child name, story content) is included in error logs.

---

## PART 8 — INPUT SANITIZATION

All inputs are sanitized before being inserted into prompts. This is the primary defense against prompt injection via the `specialNotes` or `revisionBrief` fields.

```typescript
// lib/ai/_sanitize.ts (internal)

function sanitizeUserText(input: string, maxLength: number): string {
  return input
    .slice(0, maxLength)                    // hard length cap
    .replace(/<[^>]*>/g, '')               // strip HTML tags
    .replace(/```[\s\S]*?```/g, '')        // strip code blocks
    .replace(/\n{3,}/g, '\n\n')            // collapse excessive newlines
    .trim()
}

// Applied to:
// - specialNotes: maxLength 500
// - revisionBrief: maxLength 1000
// - targetText (editor assist): maxLength 2000
```

**Additional rule:** `storyGoal` and `personality` values are validated against an approved enum list at the API route layer (Zod) before ever reaching the AI service. Free-text fields are sanitized. Structured fields are enumerated — they cannot contain arbitrary user text.

---

## PART 9 — ILLUSTRATION PROMPT DESIGN

Illustration prompts are generated in English for DALL-E. They follow a fixed template to ensure consistent style across all scenes in a story.

```typescript
// lib/ai/prompts/illustration.ts

const BASE_STYLE = [
  'warm Arabic children's book illustration style',
  'soft watercolor textures',
  'culturally authentic Middle Eastern setting',
  'child-friendly, no scary elements',
  'bright warm colors',
  'simple clear composition suitable for children ages 3-10',
].join(', ')

export function buildImagePrompt(
  scenePrompt: string,
  styleNotes: string
): string {
  return `${scenePrompt}. ${styleNotes}. Style: ${BASE_STYLE}. 
  No text, no letters, no numbers in the image.`
}

// "No text" instruction prevents DALL-E from hallucinating
// Arabic text in illustrations (a known failure mode).
```

**Cover image prompt template:**
```typescript
export function buildCoverPrompt(childName: string, storyTitle: string): string {
  return `Children's book cover illustration. A young child character in a warm,
  inviting scene that evokes wonder and adventure. Arabic cultural setting.
  Beautiful decorative border. Space at top for title text.
  Style: ${BASE_STYLE}. No text, no letters, no numbers in the image.`
}
```

---

## PART 10 — IMPLEMENTATION FILE SKETCHES

### `lib/ai/_client.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

// Instantiated once — imported only within lib/ai/
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const QA_THRESHOLD = 80
```

---

### `lib/ai/story.ts` (structure only)

```typescript
import { anthropic } from './_client'
import { buildStoryPrompt } from './prompts/story'
import { sanitizeUserText } from './_sanitize'
import type { StoryInput, StoryDraftResult } from './index'

export async function generateStoryDraft(
  input: StoryInput
): Promise<StoryDraftResult> {
  // 1. Sanitize free-text fields
  const sanitized: StoryInput = {
    ...input,
    specialNotes: input.specialNotes
      ? sanitizeUserText(input.specialNotes, 500)
      : null,
    revisionBrief: input.revisionBrief
      ? sanitizeUserText(input.revisionBrief, 1000)
      : null,
  }

  // 2. Build prompt
  const prompt = buildStoryPrompt(sanitized)
  const maxTokens = { '2-4': 700, '5-7': 1200, '8-12': 1800 }[input.ageGroup]

  // 3. Call Claude (attempt 1)
  let raw: string
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    })
    raw = response.content[0].type === 'text' ? response.content[0].text : ''
  } catch (err) {
    return handleClaudeError(err, input, 1)
  }

  // 4. Parse JSON output
  const parsed = parseStoryJSON(raw)
  if (!parsed) {
    // Retry once with reinforced JSON instruction
    if (input.attemptNumber === 1) {
      return generateStoryDraft({ ...input, attemptNumber: 2 })
    }
    return { ok: false, title: null, content: null,
             wordCount: null, tokensUsed: null, modelUsed: null,
             error: 'json_parse_failed_after_retry' }
  }

  return {
    ok: true,
    title: parsed.title,
    content: parsed.content,
    wordCount: parsed.content.split(/\s+/).length,
    tokensUsed: null,   // populated from response.usage in real impl
    modelUsed: 'claude-sonnet-4-6',
    error: null,
  }
}
```

---

### `lib/ai/images.ts` (structure only)

```typescript
import { openai } from './_client'
import { createClient } from '@/lib/supabase/server'
import { buildImagePrompt } from './prompts/illustration'
import type { ImageInput, ImageResult } from './index'

export async function generateAndStoreImage(
  input: ImageInput
): Promise<ImageResult> {
  const finalPrompt = buildImagePrompt(input.promptText, input.styleNotes)

  // 1. Generate with DALL-E 3
  let imageUrl: string
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: finalPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
    })
    imageUrl = response.data[0].url!
  } catch (err) {
    // No retry on image generation (see cost control Rule 3)
    return { ok: false, storagePath: null, fileSizeBytes: null,
             error: 'dalle_generation_failed' }
  }

  // 2. Download image bytes immediately — DALL-E URLs expire in ~1 hour
  let imageBytes: Buffer
  try {
    const res = await fetch(imageUrl)
    imageBytes = Buffer.from(await res.arrayBuffer())
  } catch {
    return { ok: false, storagePath: null, fileSizeBytes: null,
             error: 'image_download_failed' }
  }

  // 3. Upload to Supabase Storage (permanent)
  const storagePath = `stories/${input.orderId}/illustration_${input.sceneIndex}.png`
  const supabase = createClient()
  const { error: uploadError } = await supabase.storage
    .from('story-assets')
    .upload(storagePath, imageBytes, {
      contentType: 'image/png',
      upsert: false,
    })

  if (uploadError) {
    return { ok: false, storagePath: null, fileSizeBytes: null,
             error: 'storage_upload_failed' }
  }

  return {
    ok: true,
    storagePath,
    fileSizeBytes: imageBytes.length,
    error: null,
  }
}
```

---

*Document owner: Hassan Al-Alewee*
*Next action: Updated Financial Model v2.0 — rebuild unit economics with $0.30 AI cost per story, editorial labor COGS, and pay-per-story pricing.*
