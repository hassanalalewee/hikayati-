# Hikayati — Customer Experience Design v1.0
**Trust-Based Order & Delivery System**

> Status: APPROVED FOR DESIGN & IMPLEMENTATION  
> Version: 1.0  
> Date: 2026-06-27  
> Depends on: 20_BUSINESS_FOUNDATION_v2.0.md, 21_OPERATIONAL_WORKFLOW.md, 23_EDITORIAL_DASHBOARD.md

---

## DESIGN PHILOSOPHY

### The Core Principle: Opacity of AI, Transparency of Care

The customer experience is built on a single psychological contract with the parent:

> **"A professional team who cares about children made this, specifically for your child."**

Every screen, every message, every design choice either reinforces or undermines this contract. There is no neutral.

**What the parent should feel at each moment:**

| Moment | Feeling |
|---|---|
| Discovering Hikayati | "This is different. This feels premium and Arabic." |
| Placing the order | "I'm giving someone a brief to create something for my child." |
| Waiting | "A real team is working on this. I trust the process." |
| Receiving the story | "This was made for my child. I want to keep this forever." |
| Sharing it | "I want every parent I know to have this." |

---

## PART 1 — CUSTOMER JOURNEY MAP

```
DISCOVERY          ORDER             WAITING           DELIVERY          POST-DELIVERY
─────────          ─────             ───────           ────────          ─────────────
Landing page   →   Story request →   Status page   →   Story reader  →   Share / reorder
                   form                                 PDF download      Rate the story
                   Payment                              Email notif.      Gift flow
```

### Emotional Arc

```
Curiosity → Trust → Anticipation → Delight → Pride → Advocacy
    │           │          │            │        │         │
Landing      Order      Waiting     Delivery  Reading   Sharing
  page       form        page        notif.    aloud    with others
```

---

## PART 2 — SCREEN 1: LANDING PAGE

### Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Logo: حكايتي]                      [تسجيل الدخول]  [ابدأ الآن] │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│           Hero Section (full-width, warm illustrated bg)        │
│                                                                 │
│        قصة طفلك، من يدنا إلى يديه                              │
│        Your child's story. From our hands to theirs.            │
│                                                                 │
│    نكتب لطفلك قصةً مخصوصةً به — مراجعةً ومعتمدةً               │
│    من فريق تحريري متخصص في أدب الأطفال.                         │
│                                                                 │
│    We write a story made only for your child —                  │
│    reviewed and approved by our children's literature team.     │
│                                                                 │
│              [  اطلب قصة طفلك الآن  ]                          │
│                                                                 │
│    ✓ مراجعة بشرية لكل قصة          ✓ عربي أصيل بلهجتك         │
│    Human review on every story     Authentic Arabic dialect     │
│                                                                 │
│    ✓ آمن للأطفال ومعتمد تربوياً    ✓ جاهز خلال 24 ساعة        │
│    Child-safe, educationally sound  Ready within 24 hours       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              How It Works — كيف يعمل؟                          │
│                                                                 │
│   ①                    ②                     ③                 │
│  أخبرنا عن طفلك     فريقنا يكتب القصة     استلم قصتك         │
│  Tell us about      Our team writes        Receive your        │
│  your child         the story              child's story       │
│                                                                 │
│  Share your child's  Our editors craft     Beautifully         │
│  name, personality,  a story tailored      illustrated,        │
│  and what lesson     to your child and     downloadable,       │
│  they need today.    review every word.    yours forever.      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              Sample Story — نموذج من قصصنا                     │
│                                                                 │
│   [Illustrated story preview — 3 pages, RTL flip animation]    │
│   "قصة سارة والنجمة الشجاعة" — Sarah's story, age 6            │
│   [اقرأ مقتطفاً / Read a sample]                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              Trust Section — لماذا حكايتي؟                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  كل قصة تمرّ بمراجعة بشرية متخصصة                       │   │
│  │  Every story passes through specialist human review     │   │
│  │                                                         │   │
│  │  [Editor illustration — warm, human, not robotic]       │   │
│  │                                                         │   │
│  │  فريقنا التحريري من خبراء اللغة العربية وأدب الأطفال    │   │
│  │  Our editorial team are Arabic language and             │   │
│  │  children's literature specialists.                     │   │
│  │                                                         │   │
│  │  قبل أن تصل القصة إليك، يقرأها محرر متخصص              │   │
│  │  ويتحقق من جودة اللغة، والسلامة العاطفية،               │   │
│  │  والقيم التربوية — كل مرة، بلا استثناء.                 │   │
│  │                                                         │   │
│  │  Before a story reaches you, a specialist editor        │   │
│  │  reads it and verifies language quality, emotional      │   │
│  │  safety, and educational values — every time.           │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              Parent Reviews — آراء الآباء والأمهات              │
│                                                                 │
│  "بكت ابنتي حين رأت اسمها في القصة."                           │
│  "My daughter cried when she saw her name in the story."        │
│  — Maryam, Riyadh  ★★★★★                                       │
│                                                                 │
│  "أخيراً قصة عربية تشعر أن أحداً يعرف طفلي."                  │
│  "Finally an Arabic story that feels like someone knows         │
│   my child." — Tariq, London  ★★★★★                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              Pricing — الأسعار                                  │
│                                                                 │
│  [Single story]  [Story Pack × 4]  [Monthly subscription]      │
│                                                                 │
│  [  اطلب قصة طفلك الآن  ]                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PART 3 — SCREEN 2: STORY REQUEST FORM

### Design Principle
This is not a form. This is a **creative brief**. The parent is a client giving instructions to a publishing team. The language and layout must reinforce this.

### Structure — 4 Steps

```
┌─────────────────────────────────────────────────────────────────┐
│  اطلب قصة طفلك — Order Your Child's Story                      │
│                                                                 │
│  ●────────●────────○────────○                                   │
│  طفلك   القصة   اللغة    التأكيد                                │
│  Child   Story  Language  Review                                │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Step 1 — Tell Us About Your Child (طفلك)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  أخبرنا عن طفلك                                                │
│  Tell us about your child                                       │
│                                                                 │
│  الاسم الذي سيظهر في القصة *                                   │
│  The name that will appear in the story                         │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  سارة                                                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  كم عمر طفلك؟ *                                                │
│  How old is your child?                                         │
│                                                                 │
│  [2–4 سنوات]  [5–7 سنوات]  [8–12 سنة]                        │
│   (big cards, tap to select)                                    │
│                                                                 │
│  صف شخصية طفلك (اختر ما يناسب) *                               │
│  Describe your child's personality (select all that apply)     │
│                                                                 │
│  [فضولي / Curious]    [شجاع / Brave]     [حنون / Kind]        │
│  [حيوي / Energetic]   [خجول / Shy]       [مبدع / Creative]    │
│  [عنيد / Determined]  [حساس / Sensitive] [مضحك / Funny]       │
│                                                                 │
│  هل تريد إضافة صورة طفلك؟ (اختياري)                            │
│  Add a photo of your child? (optional)                         │
│  تُستخدم فقط لإلهام أسلوب الرسوم — لا تُشارك مع أي طرف ثالث   │
│  Used only to inspire illustration style — never shared        │
│                                                                 │
│  [↑ اختر صورة]                                                 │
│                                                                 │
│                                    [التالي ←]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Step 2 — The Story Brief (القصة)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ماذا تريد أن تتعلم سارة من هذه القصة؟                         │
│  What would you like Sarah to learn from this story?            │
│                                                                 │
│  [الشجاعة]    [الأمانة]   [التعاون]   [التسامح]               │
│  Courage      Honesty     Teamwork    Forgiveness               │
│                                                                 │
│  [الصداقة]   [الصبر]    [احترام الكبار]  [حب القراءة]          │
│  Friendship  Patience  Respecting elders  Love of reading       │
│                                                                 │
│  [شيء آخر / Something else...]                                  │
│                                                                 │
│  ─────────────────────────────────────────────────────────     │
│                                                                 │
│  هل هناك شيء تريدنا أن نعرفه عن سارة؟ (اختياري)                │
│  Is there anything you'd like us to know about Sarah?           │
│                                                                 │
│  مثال: "سارة تخاف من الظلام" أو "لديها أخ صغير جديد"           │
│  e.g. "Sarah is afraid of the dark" or "She has a new sibling" │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│  (max 500 characters)                                           │
│                                                                 │
│  هذه التفاصيل تساعد فريقنا في كتابة قصة تلامس قلب طفلك.       │
│  These details help our team write a story that touches        │
│  your child's heart.                                           │
│                                                                 │
│  [← السابق]                              [التالي ←]            │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Step 3 — Language & Style (اللغة)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  بأي لهجة تريد القصة؟                                          │
│  Which Arabic dialect for the story?                            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │  🌍           │  │  🇸🇦           │                            │
│  │  عربي فصيح   │  │  خليجي       │                            │
│  │  MSA          │  │  Gulf Arabic │                            │
│  │              │  │              │                            │
│  │  مناسب لجميع │  │  السعودية،   │                            │
│  │  البلدان     │  │  الإمارات،   │                            │
│  │              │  │  الكويت...   │                            │
│  └──────────────┘  └──────────────┘                            │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │  🇱🇧           │  │  🇪🇬           │                            │
│  │  شامي        │  │  مصري        │                            │
│  │  Levantine   │  │  Egyptian    │                            │
│  │              │  │              │                            │
│  │  لبنان،      │  │  مصر،        │                            │
│  │  سوريا،      │  │  السودان...  │                            │
│  │  الأردن...   │  │              │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                 │
│  [← السابق]                              [التالي ←]            │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Step 4 — Review & Confirm (التأكيد)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  راجع طلبك قبل التأكيد                                         │
│  Review your order before confirming                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  قصة لـ: سارة، 6 سنوات                                   │ │
│  │  Story for: Sarah, 6 years old                            │ │
│  │                                                           │ │
│  │  الهدف: الشجاعة / Courage                                │ │
│  │  اللهجة: خليجي / Gulf Arabic                              │ │
│  │  ملاحظات: "سارة تخاف من الظلام وتحب القطط"               │ │
│  │                                                           │ │
│  │  [تعديل / Edit]                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  🛡 ضمان الجودة                                           │ │
│  │     Quality Guarantee                                     │ │
│  │                                                           │ │
│  │  ✓ ستراجع قصة سارة محررة متخصصة                         │ │
│  │    A specialist editor will review Sarah's story          │ │
│  │                                                           │ │
│  │  ✓ نضمن السلامة العاطفية والملاءمة التربوية               │ │
│  │    We guarantee emotional safety & educational quality    │ │
│  │                                                           │ │
│  │  ✓ إذا لم تكن راضياً، نعيد الكتابة مجاناً                │ │
│  │    Not happy? We'll rewrite it, free.                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Payment component — Stripe]                                   │
│                                                                 │
│  [  تأكيد الطلب والدفع  ]                                      │
│  [  Confirm Order & Pay  ]                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PART 4 — SCREEN 3: ORDER CONFIRMATION

Shown immediately after successful payment. No loading spinner. No "processing" language.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              ✓                                                  │
│                                                                 │
│    تم استلام طلبك                                               │
│    Your order has been received                                 │
│                                                                 │
│    فريقنا يبدأ العمل على قصة سارة الآن.                        │
│    Our team is starting work on Sarah's story now.             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  ○ تم استلام الطلب ✓                                      │ │
│  │    Order received                                         │ │
│  │                                                           │ │
│  │  ○ فريقنا يُعدّ القصة...                                  │ │
│  │    Our team is preparing the story...                     │ │
│  │                                                           │ │
│  │  ○ مراجعة تحريرية                                        │ │
│  │    Editorial review                                       │ │
│  │                                                           │ │
│  │  ○ قصتك جاهزة!                                           │ │
│  │    Your story is ready!                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│    ستصلك رسالة بمجرد اكتمال القصة.                             │
│    You'll receive a message as soon as the story is complete.  │
│    عادةً خلال 4–8 ساعات.                                       │
│    Usually within 4–8 hours.                                   │
│                                                                 │
│    [  متابعة حالة القصة  ]                                     │
│    [  Track your story   ]                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PART 5 — SCREEN 4: ORDER STATUS PAGE

This page is the "waiting room." The parent will return to this page multiple times. It must be reassuring, not anxious-making.

### Status: Being Prepared

```
┌─────────────────────────────────────────────────────────────────┐
│  ← طلباتي / My Orders                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  قصة سارة                                                      │
│  Sarah's Story                                                  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  ✎  فريقنا التحريري يُعدّ قصة سارة الآن                  │ │
│  │     Our editorial team is preparing Sarah's story         │ │
│  │                                                           │ │
│  │  تُراجَع كل قصة بعناية قبل أن تصل إليك.                  │ │
│  │  Every story is carefully reviewed before it reaches you. │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ●──────────────────○──────────────────○                       │
│  تم استلام الطلب    قيد الإعداد ✎      جاهزة!                  │
│  Received           Being prepared      Ready                   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  📋 ملخص طلبك / Your order summary                        │ │
│  │                                                           │ │
│  │  الطفل: سارة، 6 سنوات                                    │ │
│  │  الهدف: الشجاعة                                          │ │
│  │  اللهجة: خليجي                                           │ │
│  │  ملاحظاتك: "سارة تخاف من الظلام وتحب القطط"              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ─────────────────────────────────────────────────────────     │
│                                                                 │
│  بينما تنتظر...                                                 │
│  While you wait...                                             │
│                                                                 │
│  هل تعلم أن القصص المخصصة تساعد الأطفال على                   │
│  تطوير التعاطف وفهم القيم بشكل أعمق؟                           │
│  Did you know that personalized stories help children           │
│  develop empathy and understand values more deeply?            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Status: Editorial Review

```
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  ✓  تم إعداد القصة — المراجعة التحريرية جارية            │ │
│  │     Story drafted — editorial review in progress          │ │
│  │                                                           │ │
│  │  محررنا يتحقق من جودة اللغة والسلامة العاطفية.            │ │
│  │  Our editor is checking language quality                  │ │
│  │  and emotional safety.                                    │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ●──────────────────●──────────────────○                       │
│  تم الاستلام         مراجعة تحريرية ✓   جاهزة!                 │
│  Received            Editorial review    Ready                  │
```

### Status: Delivered — Story Ready

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  🎉  قصة سارة جاهزة!                                           │
│      Sarah's story is ready!                                    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │   [Story cover illustration — child's name in Arabic      │ │
│  │    calligraphy, warm illustrated cover]                   │ │
│  │                                                           │ │
│  │   سارة والنجمة الشجاعة                                   │ │
│  │   Sarah and the Brave Star                               │ │
│  │                                                           │ │
│  │   ✓ راجعها فريقنا التحريري                               │ │
│  │     Reviewed by our editorial team                       │ │
│  │   ✓ آمنة للأطفال ومعتمدة تربوياً                         │ │
│  │     Child-safe and educationally approved                │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [  📖  اقرأ القصة الآن  ]   ← primary, full width            │
│  [  ↓  تنزيل PDF          ]   ← secondary                     │
│  [  ↗  شارك مع العائلة    ]   ← tertiary                      │
│                                                                 │
│  ─────────────────────────────────────────────────────────     │
│                                                                 │
│  هل أعجبتك القصة؟                                              │
│  Did you enjoy the story?                                       │
│  ★ ★ ★ ★ ★                                                     │
│                                                                 │
│  [  اطلب قصة جديدة لسارة  ]                                    │
│  [  Order a new story for Sarah  ]                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PART 6 — SCREEN 5: STORY READER

The story reader is the product delivery moment. It must feel like opening a beautifully made book.

```
┌─────────────────────────────────────────────────────────────────┐
│  [X]                               [↓ PDF]  [↗ Share]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                  ┌───────────────────┐                          │
│                  │                   │                          │
│                  │   [Cover image]   │                          │
│                  │                   │                          │
│                  │  سارة والنجمة     │                          │
│                  │  الشجاعة         │                          │
│                  │                   │                          │
│                  │  قصة خاصة لـ     │                          │
│                  │  سارة            │                          │
│                  │                   │                          │
│                  └───────────────────┘                          │
│                                                                 │
│                  [  ابدأ القراءة ← ]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Reading experience (page-turn view):**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Illustration — full width, warm Arabic illustration style]    │
│                                                                 │
│  ─────────────────────────────────────────────────────────     │
│                                                                 │
│  كانت سارةُ طفلةً شجاعةً في النهار، تلعب وتضحك وتركض         │
│  بين أشجار الحديقة. ولكن حين يأتي الليل ويُطفأ النور،         │
│  كانت قلبها يرتجف.                                             │
│                                                                 │
│  ─────────────────────────────────────────────────────────     │
│                                                                 │
│  ●●○○○○  Page 2 of 12                                          │
│                                                                 │
│  [← ]                                         [ →]             │
│  (swipe gesture supported — RTL aware)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Reader design rules:**
- RTL page-turn direction (swipe right-to-left to advance)
- Arabic text at 20px minimum — readable for parent reading aloud
- Illustration takes 40–50% of screen height per page
- No UI chrome during reading — only subtle page indicator at bottom
- Story ends with a dedicated "The End" page with child's name:
  > "نهاية قصة سارة الشجاعة ✨"
- After last page: rating prompt + share button

---

## PART 7 — TRUST DESIGN SYSTEM

### Trust Elements — Where They Appear

| Trust Element | Landing | Order Form | Status Page | Delivery | Reader |
|---|---|---|---|---|---|
| "Reviewed by editorial team" badge | ✓ | ✓ | ✓ | ✓ | ✓ |
| "Child-safe, educationally approved" | ✓ | — | — | ✓ | — |
| "Authentic Arabic" | ✓ | ✓ | — | — | — |
| Quality guarantee / rewrite promise | ✓ | ✓ | — | — | — |
| Time estimate ("4–8 hours") | — | — | ✓ | — | — |
| "Our team" language | ✓ | ✓ | ✓ | ✓ | — |

---

### Trust Badge — Visual Design

**Primary badge (shown on delivery screen and reader):**
```
┌────────────────────────────────────────┐
│  ✓  راجعها فريقنا التحريري            │
│     Reviewed by our editorial team     │
│                                        │
│  ✓  آمنة للأطفال  ✓  معتمدة تربوياً  │
│     Child-safe       Educationally     │
│                       approved         │
└────────────────────────────────────────┘
```
- Background: warm cream `#F5F0E8`
- Border: warm gold `#C9A84C`
- Icon: a small open-book or editorial quill — not a shield, not a checkmark robot
- Tone: artisanal, not bureaucratic

**Inline trust signal (used in headers, order confirmations):**
```
✎ فريقنا التحريري يُراجع كل قصة
  Our editorial team reviews every story
```

---

### Language Rules — Full Reference

#### Words that build trust (use freely)

| Arabic | English | Why it works |
|---|---|---|
| فريقنا | Our team | Human, collective, owned |
| محررونا | Our editors | Specific professional role |
| بعناية | With care | Emotional warmth |
| يُراجع | Reviews / checks | Active human verb |
| متخصص | Specialist | Expertise signal |
| مخصوص لـ / مخصصة لـ | Made just for | Personalization signal |
| معتمد تربوياً | Educationally approved | Parent's deepest concern |
| آمن للأطفال | Child-safe | Immediate reassurance |
| من يدنا | From our hands | Craft, artisanal feel |

#### Words that destroy trust (never use)

| Banned Word/Phrase | Why |
|---|---|
| ذكاء اصطناعي / AI | Destroys the human narrative instantly |
| مُولَّد / Generated | Implies automation, not craft |
| تلقائياً / Automatically | Removes human involvement |
| خوارزمية / Algorithm | Technical, cold, frightening |
| فوري / Instant | Implies no care was taken |
| نظام / System | Dehumanizes the service |
| خلال ثوانٍ / In seconds | Directly contradicts "team is working" |
| GPT / ChatGPT / Claude | Competitor association + trust destruction |
| مسودة / Draft | Makes it sound unfinished |
| معالجة / Processing | Computer language |

---

### Messaging by Status — Complete Reference

| Internal Status | Arabic Message | English Message |
|---|---|---|
| `pending` | "تم استلام طلبك — فريقنا يبدأ العمل الآن" | "Order received — our team is starting now" |
| `draft_generating` | "فريقنا التحريري يُعدّ قصة [اسم الطفل]" | "Our editorial team is preparing [name]'s story" |
| `draft_ready` | "فريقنا التحريري يُعدّ قصة [اسم الطفل]" | *(no change — same message)* |
| `under_review` | "المراجعة التحريرية جارية — نتحقق من الجودة" | "Editorial review in progress — we're checking quality" |
| `revision_requested` | "فريقنا يُدخل تحسينات أخيرة على القصة" | "Our team is making final improvements to the story" |
| `approved` | "اكتملت مراجعة الجودة — القصة في مرحلة التجهيز" | "Quality check complete — story is being prepared for you" |
| `packaging` | "قصتك تُجهَّز للتسليم — لحظات أخيرة!" | "Your story is being prepared for delivery — almost there!" |
| `delivered` | "🎉 قصة [اسم الطفل] جاهزة!" | "🎉 [Name]'s story is ready!" |
| `failed` (shown as delay) | "فريقنا يضع لمسات إضافية على القصة. شكراً لصبرك." | "Our team is adding extra care to the story. Thank you for your patience." |
| SLA breach (> 8h) | "نعتذر عن التأخير — نتواصل معك قريباً" | "We apologize for the delay — we'll be in touch shortly" |

**Rule:** The customer never sees any message that implies error, failure, technical processing, or automation. Delays are always framed as extra care, not problems.

---

## PART 8 — NOTIFICATION DESIGN

### Email — Story Ready

```
Subject: 🎉 قصة سارة جاهزة! / Sarah's story is ready!

────────────────────────────────────────────
[Hikayati logo — warm, illustrated]

مرحباً [اسم الأم/الأب],

قصة سارة جاهزة!

راجع فريقنا التحريري كل كلمة — للتأكد من
جودة اللغة، والسلامة العاطفية، والقيمة التربوية.

[Story cover thumbnail]

سارة والنجمة الشجاعة

[  اقرأ القصة الآن  ]

نتمنى أن تُصبح هذه القصة من المفضلات عند سارة.

فريق حكايتي ✨
────────────────────────────────────────────
```

### Push Notification
```
🎉 قصة سارة جاهزة!
فريقنا أنهى مراجعتها — اضغط لتقرأها الآن.
```

---

## PART 9 — POST-DELIVERY EXPERIENCE

### Rating & Feedback

Shown after last page of story reader, and again 24h later via email:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  كيف كانت قصة سارة؟                                            │
│  How was Sarah's story?                                         │
│                                                                 │
│  ★ ★ ★ ★ ★                                                     │
│  (tap to rate)                                                  │
│                                                                 │
│  [  هل قرأتها لسارة بصوت عالٍ؟  ]  ← optional share prompt    │
│  Did you read it aloud to Sarah?                                │
│                                                                 │
│  [  شارك تجربتك مع الأمهات والآباء  ]                          │
│  Share your experience with other parents                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Gifting Flow

After delivery, a secondary CTA:
```
┌─────────────────────────────────────────────────────────────────┐
│  أهدِ قصة لطفل تحبّه                                           │
│  Gift a story to a child you love                               │
│                                                                 │
│  اختر طفلاً، أخبرنا عنه، وسنُرسل القصة مباشرةً               │
│  إلى هاتف أهله — مثالية لعيد الميلاد والعيد.                  │
│  Choose a child, tell us about them, and we'll send             │
│  the story directly to their parents — perfect for              │
│  birthdays and Eid.                                             │
│                                                                 │
│  [  اطلب قصة كهدية  ]                                          │
│  [  Order a story as a gift  ]                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*Document owner: Hassan Al-Alewee*  
*Next action: Updated Financial Model v2.0 — recalculate unit economics, pricing tiers, and projections based on the human-led model (pay-per-story pricing, editorial COGS, revised subscription structure).*
