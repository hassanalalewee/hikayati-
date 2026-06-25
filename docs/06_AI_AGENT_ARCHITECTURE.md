# Hikayati — AI Agent Architecture

**Version:** 1.0 | **Date:** 2026-06-13

---

## 1. ARCHITECTURE OVERVIEW

The Hikayati AI system is a **sequential multi-agent pipeline** with parallel execution where independent, with feedback loops and quality gates. Each agent is a specialized LLM call with a curated system prompt, few-shot examples, and structured output schema.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STORY GENERATION PIPELINE                         │
├──────────────────────────────────────────────────────────────────── ┤
│                                                                       │
│  INPUT: StoryRequest                                                  │
│  {childProfile, goals, style, advisorSession?, photo?}               │
│                              │                                        │
│              ┌───────────────▼────────────────┐                      │
│              │   PHASE 1: INTELLIGENCE         │                      │
│              │                                 │                      │
│              │  Agent 1: Parent Insight        │                      │
│              │      ↓                          │                      │
│              │  Agent 2: Child Psychology      │                      │
│              │      ↓                          │                      │
│              │  Agent 3: Educational           │                      │
│              │           Specialist            │                      │
│              └───────────────┬─────────────────┘                     │
│                              │ PipelineContext                        │
│              ┌───────────────▼─────────────────┐                     │
│              │   PHASE 2: CREATION              │                     │
│              │                                  │                     │
│              │  Agent 4: Story Architect        │                     │
│              │      ↓                           │                     │
│              │  LLM: Story Generator            │                     │
│              │      ↓                           │                     │
│              │  Agent 5: Language Editor        │                     │
│              │      ↓                           │                     │
│              │  Agent 6: Cultural Sensitivity   │                     │
│              │      ↓                           │                     │
│              │  Agent 7: Character Consistency  │                     │
│              └───────────────┬──────────────────┘                    │
│                              │                                        │
│              ┌───────────────▼──────────────────┐                    │
│              │   PHASE 3: ASSETS (Parallel)      │                    │
│              │                                   │                    │
│              │  Agent 8: Illustration Director ──┤                    │
│              │  Agent 9: Cover Design ───────────┤ → Parallel         │
│              │  Audio Generator ─────────────────┘                    │
│              └───────────────┬──────────────────┘                    │
│                              │                                        │
│              ┌───────────────▼──────────────────┐                    │
│              │   PHASE 4: PACKAGE                │                    │
│              │                                   │                    │
│              │  Agent 10: Parent Coach           │                    │
│              │      ↓                            │                    │
│              │  Agent 11: QA (→ auto-retry)      │                    │
│              │      ↓                            │                    │
│              │  Agent 12: Development Planner    │                    │
│              └───────────────┬──────────────────┘                    │
│                              │                                        │
│  OUTPUT: StoryPackage                                                 │
│  {story, illustrations, cover, audio, parentGuide, devReport}        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. PIPELINE CONTEXT OBJECT

All agents read from and write to a shared `PipelineContext` object that flows through the pipeline:

```typescript
interface PipelineContext {
  // Input
  request: StoryRequest;
  childProfile: ChildProfile;
  
  // Phase 1 outputs
  insights: ParentInsights;
  psychologyValidation: PsychologyReport;
  educationalObjectives: LearningObjectives;
  
  // Phase 2 outputs
  blueprint: StoryBlueprint;
  rawStory: string;
  story: StoryContent;
  
  // Phase 3 outputs
  illustrations: IllustrationSet;
  cover: CoverDesign;
  audioUrl?: string;
  
  // Phase 4 outputs
  parentGuide: ParentGuide;
  qaReport: QAReport;
  developmentUpdate: DevelopmentUpdate;
  
  // Metadata
  tokensUsed: number;
  costUsd: number;
  startedAt: Date;
  agentLog: AgentLogEntry[];
}
```

---

## 3. AGENT SPECIFICATIONS

### Agent 1: Parent Insight Agent

**Purpose:** Synthesize parent goals and child data into a rich personalization brief.

**Model:** Claude claude-sonnet-4-6 (nuanced understanding)

**System Prompt:**
```
أنت محلل نفسي متخصص في فهم احتياجات الأطفال العرب. 
مهمتك: تحليل طلب الوالدين وبناء ملف تفصيلي للطفل يُعبّر عن شخصيته وتحدياته وأهدافه بعمق.
أخرج JSON منظماً وفق الهيكل المطلوب.
```

**Input:**
```typescript
{
  childName: string;
  age: number;
  gender: string;
  country: string;
  hobbies: string[];
  favoriteAnimal: string;
  favoriteColor: string;
  goals: string[];
  advisorChallengeText?: string;
}
```

**Output Schema:**
```typescript
interface ParentInsights {
  childPersonality: {
    traits: string[];           // ["curious", "energetic", "shy around strangers"]
    communicationStyle: string; // "visual and action-oriented"
    emotionalProfile: string;   // "sensitive, needs validation"
  };
  coreChallenge: {
    description: string;
    rootCauses: string[];
    emotionalNeeds: string[];
    urgency: 'low' | 'medium' | 'high';
  };
  storyDirection: {
    primaryGoal: string;
    secondaryGoal?: string;
    recommendedTheme: string;
    avoidThemes: string[];
  };
  personalizationBrief: {
    heroTraits: string[];
    heroStrengths: string[];
    heroGrowthArc: string;
    settingPreferences: string[];
    companionIdea: string;
  };
}
```

---

### Agent 2: Child Psychology Agent

**Purpose:** Validate emotional safety, age appropriateness, and self-esteem promotion.

**Model:** Claude claude-sonnet-4-6

**System Prompt:**
```
أنت معالج نفسي للأطفال متخصص في علم النفس التنموي للأطفال العرب.
مهمتك: مراجعة توجهات القصة والتحقق من سلامتها النفسية وملاءمتها للعمر.
يجب أن تكون القصة آمنة عاطفياً، تُعزز الاحترام الذاتي، ولا تستخدم الخوف أو العقاب.
```

**Validation Checklist:**
- Age-appropriate language and concepts
- No shame, guilt, or fear-based messaging
- Growth mindset framing (mistakes = learning)
- Cultural sensitivity (Arab family dynamics)
- Positive resolution guaranteed
- No trauma triggers

**Output Schema:**
```typescript
interface PsychologyReport {
  isApproved: boolean;
  safetyScore: number;        // 0-100
  ageAppropriateScore: number;
  modifications: string[];    // required changes if not approved
  warnings: string[];         // cautions for story writer
  enhancedGoals: string[];    // psychology-informed additions
}
```

---

### Agent 3: Educational Specialist Agent

**Purpose:** Define precise learning objectives and validate developmental suitability.

**Model:** GPT-4o (educational reasoning)

**System Prompt:**
```
You are an early childhood education specialist with expertise in Arabic curriculum development.
Define measurable learning objectives for the story, aligned with child development milestones.
Output in structured JSON.
```

**Output Schema:**
```typescript
interface LearningObjectives {
  primaryObjective: {
    skill: string;
    ageAlignment: string;
    measurementIndicators: string[];
  };
  secondaryObjectives: LearningObjective[];
  vocabularyTargets: {
    newWords: string[];   // age-appropriate new vocab to introduce
    conceptLevel: string;
  };
  cognitiveLevel: 'knowledge' | 'comprehension' | 'application' | 'analysis';
  discussionFramework: string[];  // how parent can extend learning
}
```

---

### Agent 4: Story Architect Agent

**Purpose:** Design the complete story structure before any text is generated.

**Model:** Claude claude-opus-4-8 (complex creative planning)

**System Prompt:**
```
أنت كاتب ومخرج قصص للأطفال من الطراز الأول، خبير في بناء الروايات التي تُحرّك المشاعر.
مهمتك: تصميم هيكل القصة الكاملة وفق إطار "الرحلة التحويلية الست مراحل".
يجب أن يصبح الطفل بطلاً حقيقياً يعيش مغامرة تُغيّر شيئاً فيه.
```

**6-Act Framework:**
```
Act 1 — Introduction:
  - Establish hero (child) in their world
  - Show their normal life, strengths, and one area to grow
  - Plant the seed of the challenge (subtle)

Act 2 — Challenge:
  - Inciting incident that requires the growth skill
  - Hero attempts old pattern (fails or is incomplete)
  - Emotional stakes raised

Act 3 — Discovery:
  - Hero encounters guide, ally, or experience
  - New perspective or approach discovered
  - Internal shift begins

Act 4 — Growth:
  - Hero applies new understanding
  - Struggle and setbacks (realistic)
  - Deeper insight emerges

Act 5 — Resolution:
  - Hero uses growth skill successfully
  - Challenge resolved through their development
  - Not a "magical fix" but earned transformation

Act 6 — Transformation:
  - New normal established
  - Hero reflects on journey
  - Subtle lesson embodied (never stated)
  - Inspiring ending that motivates child
```

**Output Schema:**
```typescript
interface StoryBlueprint {
  title: string;                    // Arabic title
  subtitle: string;                 // tagline
  heroDescription: string;          // visual + personality
  settingDescription: string;       // where the story takes place
  companionCharacter: {
    name: string;
    type: string;                   // animal, friend, magical helper
    role: string;
  };
  acts: StoryAct[];                 // 6 acts with scene descriptions
  illustrationMoments: {           // key visual scenes for illustration
    pageNum: number;
    sceneDescription: string;
    emotionalTone: string;
    illustrationPrompt: string;
  }[];
  embeddedLesson: string;          // how lesson is woven in (never direct)
  pageCount: number;               // suggested 8-12
  estimatedWordCount: number;
}
```

---

### Agent 5: Language Editor Agent

**Purpose:** Elevate story language to native Arabic children's book quality.

**Model:** Claude claude-opus-4-8 (Arabic language mastery)

**System Prompt:**
```
أنت محرر لغوي أول في دار نشر أطفال عربية رائدة. خبرتك 20 عاماً في صياغة أجمل قصص الأطفال.
مهمتك: تحويل النص إلى أدب أطفال عربي راقٍ، يتدفق بطبيعية، ويُشعر القارئ أن إنساناً حكيماً كتبه.

معايير الجودة:
- تدفق الإيقاع: كل جملة لها موسيقاها
- التصوير: الصور البلاغية تُحرّك العقل والقلب
- الصوت: صوت القصة مناسب لعمر الطفل
- التشويق: كل فقرة تدفع للقراءة التالية
- الطبيعية: لا يشبه النص المُنتج بالذكاء الاصطناعي أبداً
- اسم الطفل: يظهر بشكل طبيعي 12-18 مرة
```

**Quality Targets:**
- Rhythm score: ≥95 (subjective evaluation via self-assessment)
- AI-pattern detection: 0 patterns
- Age vocabulary alignment: 98%+
- Cultural references: 100% appropriate
- Name integration: natural appearances every 3-4 paragraphs

---

### Agent 6: Cultural Sensitivity Agent

**Purpose:** Ensure the story reflects authentic Arabic regional culture.

**Model:** Claude claude-sonnet-4-6

**Dialect Adaptation Rules:**

| Dialect | Key Adaptations |
|---------|----------------|
| Gulf | Vocabulary like "يا ولدي"/"يا بنتي", desert/sea settings, majlis culture, camel/falcon references |
| Levantine | Mountain/olive tree settings, "يلا", food like knafeh, hummus, family gatherings |
| Egyptian | Nile references, "يا حبيبي", popular culture, urban/rural mix |
| MSA | Formal but accessible, universal Arabic references |

**Cultural Validation:**
- Family values (obedience with agency)
- Islamic etiquette (greetings, bismillah in context)
- Regional food, clothing, architecture
- Historical/geographical references
- Name appropriateness per region

---

### Agent 7: Character Consistency Agent

**Purpose:** Maintain visual and narrative consistency of all characters.

**Model:** GPT-4o Vision (when photo provided)

**If Photo Provided:**
1. Analyze child photo for visual features
2. Generate detailed character description (hair, eyes, skin, build)
3. Create consistent illustration prompts referencing these features
4. Flag any inconsistencies in illustration batch

**If No Photo:**
1. Generate a warm, friendly "everychild" hero based on name + region
2. Define consistent visual identity
3. Apply consistently across all illustration prompts

**Character Sheet Output:**
```typescript
interface CharacterSheet {
  hero: {
    name: string;
    visualDescription: string;      // detailed for illustration AI
    clothingStyle: string;
    distinctiveFeatures: string;
    emotionalExpressions: {         // for illustrator reference
      happy: string;
      determined: string;
      nervous: string;
      triumphant: string;
    };
  };
  companions: CharacterEntry[];
  settings: {
    name: string;
    description: string;
    lightingNotes: string;
  }[];
  illustrationStyle: {
    colorPalette: string[];
    artStyle: string;               // e.g., "warm watercolor children's book"
    lineWeight: string;
    moodBoard: string;
  };
}
```

---

### Agent 8: Illustration Director Agent

**Purpose:** Generate 8–12 high-quality, consistent illustrations.

**Model:** OpenAI DALL-E 3 / Flux Pro

**Prompt Engineering Template:**
```
Children's book illustration, warm watercolor style, Arabic cultural elements.
Scene: {sceneDescription}
Character: {characterDescription}, wearing {clothing}, {expression} expression.
Setting: {settingDescription}, {timeOfDay}, {atmosphere}.
Color palette: {palette}.
Style: professional children's book, {ageGroup}-year-old audience.
Mood: {emotionalTone}.
Technical: high detail, soft edges, printable quality, 300 DPI.
NO text in image. NO watermarks.
```

**Quality Checklist per Illustration:**
- Character appearance matches Character Sheet
- Cultural elements are accurate
- Age-appropriate content
- Emotional tone matches story beat
- Professional quality (no AI artifacts)
- Print-ready resolution

**Iteration Strategy:**
- Generate 2 variations per scene
- Score each on: character consistency, quality, emotional accuracy
- Select best per scene
- Flag for human review if score < 85

---

### Agent 9: Cover Design Agent

**Purpose:** Generate a compelling, professional book cover.

**Model:** DALL-E 3 + GPT-4o (text overlay)

**Cover Requirements:**
- Hero prominently featured
- Story world established (setting visible)
- Arabic title in prominent, child-appropriate font
- Color palette: warm, inviting, age-appropriate
- Professional children's book publisher quality
- Spine-ready format (for print edition)

**Cover Prompt Template:**
```
Children's book cover design. Arabic children's book.
Title: {arabicTitle}
Hero: {heroDescription}, {expression}, action pose.
Scene: {coverScene} - represents the story's core adventure.
Style: premium Arabic children's book, 2024, professional illustration.
Colors: {palette} - warm, inviting, age-appropriate.
Layout: full bleed illustration, title space at top/bottom.
Quality: print-ready 300 DPI, publisher quality.
```

---

### Agent 10: Parent Coach Agent

**Purpose:** Generate a complete parent development toolkit.

**Model:** Claude claude-sonnet-4-6

**Output Components:**

```typescript
interface ParentGuide {
  lessonSummary: {
    coreLesson: string;                // what the story teaches
    howItWasEmbedded: string;          // HOW lesson appears in story
    childDevelopmentContext: string;   // why this matters developmentally
  };
  discussionQuestions: {
    openEnded: string[];               // 5 open-ended questions
    reflective: string[];              // 3 "how did you feel when..." questions
    applicationBased: string[];        // 2 "what would you do if..." questions
  };
  familyActivities: {
    title: string;
    description: string;
    materials: string[];
    duration: string;
    ageAdaptation: string;
  }[];                                 // 3 activities
  positiveReinforcement: {
    phrases: string[];                 // Arabic praise phrases to use
    behaviors: string[];               // specific behaviors to look for
    celebrations: string[];            // ways to celebrate growth
  };
  parentingRecommendations: {
    immediateActions: string[];        // do this week
    ongoingPractices: string[];        // build these habits
    watchFor: string[];                // behavioral signs of progress
    professionalSupport: string;       // when to seek help (if relevant)
  };
  readAgainTips: string[];             // how to maximize re-reads
}
```

---

### Agent 11: Quality Assurance Agent

**Purpose:** Multi-dimensional quality validation with automatic revision triggers.

**Model:** Claude claude-opus-4-8

**Scoring Rubric:**

| Dimension | Weight | Criteria |
|-----------|--------|---------|
| Story Quality | 25% | Narrative coherence, engagement, pacing |
| Language Quality | 25% | Native fluency, age-appropriate vocab, no AI patterns |
| Educational Effectiveness | 20% | Goal embedded naturally, learning objectives met |
| Emotional Safety | 15% | No harmful elements, positive framing, safe ending |
| Personalization Accuracy | 10% | Child name used correctly, personal details woven in |
| Cultural Authenticity | 5% | Regional accuracy, Islamic values (if selected) |

**Thresholds:**
- Score ≥ 90: Pass → proceed to delivery
- Score 80–89: Minor revision → Language Editor revises specific sections
- Score < 80: Full revision → Story Architect redesigns + regenerates

**Maximum Revision Cycles:** 2 (then flag for human review)

**QA Output:**
```typescript
interface QAReport {
  passed: boolean;
  overallScore: number;
  dimensionScores: Record<string, number>;
  issues: {
    severity: 'critical' | 'major' | 'minor';
    dimension: string;
    location: string;
    description: string;
    suggestedFix: string;
  }[];
  revisionInstructions: string;  // for revision agent if needed
  approvedForDelivery: boolean;
}
```

---

### Agent 12: Development Planner Agent

**Purpose:** Update child's long-term development profile and generate recommendations.

**Model:** Claude claude-sonnet-4-6

**Responsibilities:**
1. Analyze ALL stories created for this child
2. Calculate development scores per category
3. Identify patterns and gaps
4. Generate 3 recommended next stories
5. Update growth roadmap
6. Trigger milestone badges if thresholds reached

**Development Categories (scored 0–100):**
```
honesty, responsibility, courage, self_confidence,
emotional_intelligence, respect, kindness, discipline,
gratitude, leadership, creativity, anti_bullying,
islamic_values, problem_solving, friendship, resilience,
time_management, communication, social_skills
```

**Milestone Triggers:**
```typescript
const MILESTONE_RULES = {
  'honesty_hero': { category: 'honesty', storiesRequired: 3, minScore: 70 },
  'courage_explorer': { category: 'courage', storiesRequired: 2, minScore: 65 },
  'reading_master': { totalStories: 10 },
  'growth_champion': { avgScore: 80, categories: 5 },
  // ... 20+ milestone definitions
};
```

---

## 4. MODEL SELECTION STRATEGY

| Task | Primary Model | Fallback | Reason |
|------|--------------|---------|--------|
| Story generation | Claude claude-opus-4-8 | GPT-4o | Best Arabic creative writing |
| Language editing | Claude claude-opus-4-8 | Claude claude-sonnet-4-6 | Arabic fluency excellence |
| Analysis agents | Claude claude-sonnet-4-6 | GPT-4o-mini | Cost-efficient reasoning |
| Illustrations | DALL-E 3 | Flux Pro | Quality + reliability |
| Cover design | DALL-E 3 | Midjourney API | Professional quality |
| Audio narration | ElevenLabs | OpenAI TTS | Arabic voice quality |
| Educational agent | GPT-4o | Claude claude-sonnet-4-6 | Structured output reliability |

---

## 5. COST ESTIMATION PER STORY

| Component | Model | Approx. Cost |
|-----------|-------|-------------|
| Parent Insight Agent | Claude claude-sonnet-4-6 | $0.03 |
| Psychology Agent | Claude claude-sonnet-4-6 | $0.02 |
| Educational Agent | GPT-4o | $0.04 |
| Story Architect | Claude claude-opus-4-8 | $0.15 |
| Story Generation | Claude claude-opus-4-8 | $0.40 |
| Language Editor | Claude claude-opus-4-8 | $0.20 |
| Cultural + Consistency | Claude claude-sonnet-4-6 | $0.04 |
| Illustrations (10×) | DALL-E 3 | $0.40 |
| Cover | DALL-E 3 | $0.04 |
| Audio (10 min) | ElevenLabs | $0.15 |
| Parent Coach | Claude claude-sonnet-4-6 | $0.05 |
| QA Agent | Claude claude-opus-4-8 | $0.10 |
| Dev Planner | Claude claude-sonnet-4-6 | $0.03 |
| **Total per story** | | **~$1.55** |

**With optimizations (caching, prompt compression):** ~$0.90–$1.10  
**Target unit economics:** $14.99 Premium / $1.10 cost = **13.6× gross margin on AI**

---

## 6. PROMPT ENGINEERING PATTERNS

### Arabic Quality Patterns

**Anti-Pattern (avoid):**
```
كان علي ولداً جيداً. تعلم أن الصدق مهم. قرر أن يكون صادقاً دائماً.
[Direct, preachy, robotic]
```

**Target Pattern:**
```
في صباح يوم من أيام ربيع دافئة، استيقظ علي على رائحة خبز أمه 
الطازج يملأ البيت كله. قفز من سريره كحبة زئبق، وقلبه يرقص 
بفرحة يوم المدرسة الجديد...
[Sensory, rhythmic, child-perspective, engaging]
```

### Few-Shot Examples Library

The prompts folder contains 50+ high-quality Arabic children's story excerpts, organized by:
- Age group (3–4, 5–7, 8–10, 11–13)
- Story style (adventure, Islamic, animals, etc.)
- Emotional tone (courage, honesty, kindness, etc.)
- Dialect (MSA, Gulf, Levantine, Egyptian)

These are injected as few-shot examples to anchor the model's output quality.

---

## 7. ERROR HANDLING & RESILIENCE

```typescript
// Agent retry configuration
const AGENT_RETRY_CONFIG = {
  maxRetries: 3,
  backoffMs: [1000, 3000, 9000],
  retryOn: ['rate_limit', 'timeout', 'server_error'],
  failOnQualityScore: 60,   // abort if QA < 60 after 2 revisions
};

// Fallback chain
const MODEL_FALLBACK_CHAIN = {
  'claude-opus-4-8': 'claude-sonnet-4-6',
  'claude-sonnet-4-6': 'gpt-4o',
  'gpt-4o': 'gpt-4o-mini',
  'dall-e-3': 'flux-pro',
  'elevenlabs': 'openai-tts',
};

// Graceful degradation
// If illustration generation fails: deliver story + PDF without images
// If audio generation fails: deliver story without audio, offer retry
// If QA fails after 2 revisions: deliver with quality warning, offer refund credit
```

---

*For implementation details see packages/ai-agents/ in the monorepo.*
