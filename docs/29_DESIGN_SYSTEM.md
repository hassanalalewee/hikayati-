# Hikayati — Design System v1.0
**Visual Identity: Premium Arabic Children's Publishing Platform**

> Version: 1.0 — Date: 2026-06-27
> Status: APPROVED — applied to codebase

---

## MOOD & IDENTITY

Hikayati is not a tech product. It is a publishing house — warm, trusted, and made for families.

**The feeling we are designing for:**
- The weight of a beautiful hardcover children's book
- The smell of fresh pages
- A grandmother reading to a child by warm light
- A premium gift, carefully wrapped

**What we are not:**
- A startup dashboard
- An AI tool interface
- A social media app
- A gamified children's app

---

## PART 1 — COLOR SYSTEM

### Design Philosophy
The palette is built around **warm neutrals anchored by a deep ink tone**, with **soft teal as the trust signal** and **muted gold as the quality signal**. Every color has a reason. Nothing is decorative without purpose.

---

### Primary Palette

| Token | HEX | HSL | Usage |
|---|---|---|---|
| `ink-950` | `#1A1814` | 30 10% 9% | Primary text, main CTA, brand mark |
| `ink-800` | `#2E2A24` | 33 10% 16% | Headings, dark surfaces |
| `ink-600` | `#4B4640` | 30 8% 27% | Body text, secondary headings |
| `ink-400` | `#6B6560` | 25 6% 40% | Secondary text, labels |
| `ink-200` | `#9B9590` | 30 5% 58% | Placeholder, disabled, captions |
| `ink-100` | `#C8C2BC` | 28 8% 76% | Subtle borders |

**Why ink tones:** Arabic calligraphy and classical publishing uses deep warm blacks, not cold grays. Ink tones feel literary, not digital.

---

### Surface Palette

| Token | HEX | HSL | Usage |
|---|---|---|---|
| `paper-50` | `#FAFAF8` | 60 11% 98% | Page background |
| `paper-100` | `#F5F2ED` | 38 20% 95% | Section backgrounds |
| `paper-200` | `#EDE8E0` | 35 22% 90% | Card backgrounds |
| `paper-300` | `#E8E4DC` | 37 18% 87% | Borders, dividers |
| `paper-400` | `#D9D3C8` | 38 16% 82% | Stronger borders |

**Why paper tones:** Warm white that recalls quality paper. Not the cold `#FFFFFF` of a screen, but the creamy warmth of a printed page.

---

### Trust Color — Teal

| Token | HEX | HSL | Usage |
|---|---|---|---|
| `teal-600` | `#0D7C6F` | 174 82% 27% | Primary interactive (links, focus rings) |
| `teal-500` | `#0F9080` | 174 80% 31% | Hover state |
| `teal-100` | `#D0F0EC` | 174 55% 88% | Teal tint backgrounds |
| `teal-50` | `#E8FAF7` | 174 55% 95% | Very subtle teal wash |

**Why teal:** Teal reads as trust, calm, and expertise — the color of pediatric healthcare, quality education, and premium children's brands globally. It is soft enough for children, professional enough for parents. It does not read as "tech" the way blue does.

---

### Quality Signal — Warm Gold

| Token | HEX | HSL | Usage |
|---|---|---|---|
| `gold-600` | `#C9A84C` | 42 56% 55% | Trust badges, quality marks, editorial seal |
| `gold-400` | `#D9BC76` | 42 52% 66% | Softer gold accents |
| `gold-100` | `#F5F0E8` | 38 53% 94% | Gold-tinted backgrounds |
| `gold-border` | `#E8D9A8` | 42 53% 80% | Gold border tint |

**Why gold:** Gold signals editorial quality, premium publishing, and earned trust — not flashy luxury. Think Penguin Books spine, not a casino. Used sparingly: trust badges, the seal of editorial review, award markers.

---

### Semantic Colors

| Token | HEX | Usage |
|---|---|---|
| `success-600` | `#16A34A` | Delivered, approved, complete |
| `success-50` | `#F0FDF4` | Success background |
| `warning-600` | `#D97706` | SLA approaching, review needed |
| `warning-50` | `#FFFBEB` | Warning background |
| `error-600` | `#DC2626` | Error states |
| `error-50` | `#FEF2F2` | Error background |

---

### Full Color Palette Reference

```
BRAND IDENTITY
──────────────────────────────────────────────────
ink-950   #1A1814   ████████  Main brand, primary CTA
ink-800   #2E2A24   ███████░  Headings
ink-600   #4B4640   █████░░░  Body text
ink-400   #6B6560   ████░░░░  Secondary text
ink-200   #9B9590   ███░░░░░  Captions, placeholders
ink-100   #C8C2BC   ██░░░░░░  Subtle borders

SURFACES
──────────────────────────────────────────────────
paper-50  #FAFAF8   ████████  Page background
paper-100 #F5F2ED   ███████░  Section bg
paper-200 #EDE8E0   ██████░░  Cards
paper-300 #E8E4DC   █████░░░  Dividers
paper-400 #D9D3C8   ████░░░░  Strong borders

TRUST — TEAL
──────────────────────────────────────────────────
teal-600  #0D7C6F   ████████  Links, CTA (alt), focus
teal-500  #0F9080   ███████░  Hover
teal-100  #D0F0EC   ████░░░░  Teal wash
teal-50   #E8FAF7   ██░░░░░░  Subtle teal bg

QUALITY — GOLD
──────────────────────────────────────────────────
gold-600  #C9A84C   ████████  Badges, seals
gold-400  #D9BC76   ██████░░  Soft accents
gold-100  #F5F0E8   ████░░░░  Gold bg tint
```

---

## PART 2 — TYPOGRAPHY SYSTEM

### Arabic — Cairo (Primary)
**Use for:** All UI — headings, body text, buttons, labels, navigation

Cairo is Google's premier Arabic typeface. It is:
- Clean and modern without feeling cold
- Designed for screen readability at all sizes
- Friendly without being childish
- Used by premium Arabic digital products (MBC, Noon, etc.)
- Excellent RTL rendering with proper Arabic letterforms

```css
font-family: 'Cairo', sans-serif;
```

### Arabic — Noto Sans Arabic (Story body)
**Use for:** Story reading experience only

Noto Sans Arabic is:
- Optimized for long-form Arabic reading
- More traditional letterforms — closer to handwritten Arabic
- Better for children reading stories (more like a book, less like a UI)

```css
font-family: 'Noto Sans Arabic', sans-serif;
```

### English — Inter (Utility)
**Use for:** Numbers, Latin characters, LTR inputs (email, password), code
Already available via system-ui stack. No separate import needed.

---

### Type Scale

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `display` | 48–56px | 800 | 1.2 | Hero headline only |
| `h1` | 36–40px | 700 | 1.3 | Page titles |
| `h2` | 28–32px | 700 | 1.35 | Section headings |
| `h3` | 22–24px | 700 | 1.4 | Card titles, subsections |
| `h4` | 18–20px | 600 | 1.45 | Labels, sub-headings |
| `body-lg` | 18px | 400 | 1.9 | Story body, key descriptions |
| `body` | 16px | 400 | 1.7 | Standard UI text |
| `body-sm` | 14px | 400 | 1.6 | Secondary labels, metadata |
| `caption` | 12px | 400 | 1.5 | Timestamps, tiny labels |

**Arabic line height:** Always use `1.8–2.0` for body text. Arabic letters have more vertical space requirements than Latin. Tight line height makes Arabic unreadable.

---

## PART 3 — SPACING SYSTEM

Based on a 4px base unit. Following the principle: **breathe generously, never crowd**.

| Token | Value | Use |
|---|---|---|
| `space-1` | 4px | Icon gaps, tiny internal padding |
| `space-2` | 8px | Tight element spacing |
| `space-3` | 12px | Input padding, small gaps |
| `space-4` | 16px | Standard element padding |
| `space-5` | 20px | Card padding (compact) |
| `space-6` | 24px | Card padding (standard) |
| `space-8` | 32px | Section internal gaps |
| `space-10` | 40px | Between major UI elements |
| `space-12` | 48px | Section padding |
| `space-16` | 64px | Large section padding |
| `space-20` | 80px | Hero/section top/bottom |
| `space-24` | 96px | Maximum hero padding |

---

## PART 4 — BORDER RADIUS

Soft, friendly, never sharp. Never a perfect circle on content cards.

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 8px | Small elements: badges, tags, inputs |
| `radius-md` | 12px | Buttons, small cards |
| `radius-lg` | 16px | Standard cards |
| `radius-xl` | 20px | Large cards, modals |
| `radius-2xl` | 24px | Feature cards, hero elements |
| `radius-full` | 9999px | Pills, avatars, circular icons |

---

## PART 5 — SHADOW SYSTEM

Shadows are **barely there**. They suggest elevation without casting drama.

| Token | Value | Use |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(26,24,20,0.04)` | Subtle card lift |
| `shadow-sm` | `0 1px 4px rgba(26,24,20,0.06), 0 1px 2px rgba(26,24,20,0.04)` | Card default |
| `shadow-md` | `0 4px 12px rgba(26,24,20,0.08), 0 1px 4px rgba(26,24,20,0.04)` | Card hover, modals |
| `shadow-lg` | `0 8px 24px rgba(26,24,20,0.10), 0 2px 8px rgba(26,24,20,0.06)` | Dropdowns, popovers |

**Rule:** Always use warm shadow color `rgba(26,24,20,...)` — never cool gray shadows on warm surfaces.

---

## PART 6 — COMPONENT STYLE GUIDE

### Buttons

**Primary Button — Main CTA**
```
Background: #1A1814 (ink-950)
Text: #FAFAF8 (paper-50)
Border radius: 12px
Padding: 14px 28px
Font: Cairo, 15px, weight 700
Hover: #2E2A24 (ink-800)
Active: scale(0.98)
Disabled: opacity 40%, no cursor
Shadow: none (flat)
```

**Secondary Button — Supporting action**
```
Background: transparent
Border: 1.5px solid #E8E4DC (paper-300)
Text: #1A1814 (ink-950)
Border radius: 12px
Padding: 13px 24px
Hover: background #F5F2ED (paper-100)
```

**Teal Button — Trust action (editorial approval, consent)**
```
Background: #0D7C6F (teal-600)
Text: white
Border radius: 12px
Padding: 14px 28px
Hover: #0F9080 (teal-500)
Use: approval actions, consent confirmation
```

**Ghost Button — Minimal action**
```
Background: transparent
Text: #4B4640 (ink-600)
Hover: background #F5F2ED, text #1A1814
No border
```

---

### Cards

**Story Card**
```
Background: #FFFFFF
Border: 1px solid #E8E4DC (paper-300)
Border radius: 16px
Shadow: shadow-sm
Hover: shadow-md, border-color #D9D3C8
Padding: 0 (cover image flush) + 16px bottom section
Transition: shadow 200ms ease, border 200ms ease
Cover image: aspect-ratio 3/4 (portrait book format)
```

**Child Profile Card**
```
Background: #FFFFFF
Border: 1px solid #E8E4DC
Border radius: 20px
Shadow: shadow-xs
Hover: border-color #0D7C6F (teal), shadow-sm
Padding: 20px
```

**Trust / Editorial Badge**
```
Background: #F5F0E8 (gold-100)
Border: 1px solid #E8D9A8 (gold-border)
Border radius: 12px
Text: #4B4640 (ink-600)
Gold checkmark: #C9A84C (gold-600)
Padding: 12px 20px
```

**Status Badge — Order state**
```
pending / generating:  bg #F5F2ED, text #4B4640, dot #9B9590
under_review:          bg #E8FAF7, text #0D7C6F, dot #0D7C6F
delivered:             bg #F0FDF4, text #16A34A, dot #16A34A
failed:                bg #FEF2F2, text #DC2626, dot #DC2626
SLA urgent (<1h):      bg #FEF2F2, text #DC2626
```

---

### Forms

**Input field**
```
Background: #FFFFFF
Border: 1.5px solid #E8E4DC
Border radius: 10px
Padding: 12px 16px
Font: Cairo 15px
Color: #1A1814
Placeholder: #9B9590
Focus: border-color #0D7C6F, ring 2px teal-50
Error: border-color #DC2626
RTL: text-align right by default
```

**Label**
```
Font: Cairo 14px weight 600
Color: #1A1814
Margin-bottom: 6px
```

**Helper text / error message**
```
Font: Cairo 12px
Error color: #DC2626
Helper color: #6B6560
```

---

### Modals / Overlays
```
Backdrop: rgba(26,24,20,0.4) blur(4px)
Modal background: #FFFFFF
Border radius: 20px
Shadow: shadow-lg
Max-width: 480px (standard), 640px (wide)
Padding: 32px
```

---

### Progress Indicators

**Order status steps (3-step)**
```
Inactive step:   circle #E8E4DC, text #9B9590
Active step:     circle #1A1814, text #1A1814
Complete step:   circle #0D7C6F, checkmark white, text #1A1814
Connector line:  #E8E4DC → #1A1814 (fills left-to-right / right-to-left in RTL)
```

**SLA countdown**
```
Normal:    #6B6560
Warning (<2h): #D97706
Urgent (<1h):  #DC2626
Font: Inter Mono 12px weight 600 (numbers only)
```

---

## PART 7 — BACKGROUND & TEXTURE

**Page background:** `#FAFAF8` — a very slightly warm white. Not pure white.

**Section alternation:**
- Primary sections: `#FAFAF8`
- Secondary/trust sections: `#F5F2ED` (paper-100) — slightly warmer
- Gold-accent sections: `#F5F0E8` (gold-100) — used for trust banners only

**Gradient use:**
- Hero: `linear-gradient(180deg, #FAFAF8 0%, #F5F2ED 100%)` — barely perceptible
- Card hover: none (use shadow instead)
- Cover image placeholder: `linear-gradient(135deg, #EDE8E0 0%, #E8E4DC 100%)`

**No patterns. No textures. No illustrations as background.** The warmth comes from color temperature, not decoration.

---

## PART 8 — ICONOGRAPHY

**Style:** Lucide React (already in use) — line icons, 1.5px stroke
**Size:** 16px (inline), 20px (UI), 24px (feature), 32px (empty states)
**Color:** Match text color of context — never a different color unless semantic

**Avoid:**
- Filled icons (feel heavier, less editorial)
- Icons larger than 32px in most contexts
- Decorative icons that don't communicate meaning
- Emoji in professional UI contexts (acceptable in story content only)

---

## PART 9 — EXAMPLE LAYOUTS

### Homepage — Mood Description

Navigation: Paper-white bar, thin warm border below, ink logo left, two text links + one primary CTA button right.

Hero: Center-aligned on warm paper background. Large bold Arabic h1 in ink-950. Supporting text in ink-600. Single primary CTA button (ink, not teal). Below: small trust line in ink-200.

Trust banner: Gold-100 background, gold border top and bottom. Four trust checkmarks in gold-600 with ink-600 text. Horizontal row on desktop, stacked on mobile.

How it works: Three steps, large emoji icons in paper-200 circles. Step labels in ink-200, titles in ink-950, descriptions in ink-600.

Editorial trust section: White background, centered. Pen icon in paper-200 circle. H2 in ink-950. Body in ink-600. Gold badge below.

Testimonials: Gold-100 background. White cards with gold star ratings.

CTA section: Paper-100 background. Centered h2, supporting text, primary button.

---

### Story Status Page — Mood Description

Clean single-column layout on paper-50. Parent's summary card in white with paper-300 border. 3-step progress bar in teal (completed steps) and paper (pending). Status message in ink-950, large, calm. Trust badge in gold-100. If delivered: large teal CTA button "اقرأ القصة الآن".

---

### Editor Dashboard — Mood Description

Distinct from customer UI. Paper-50 background, editorial header in white with warm border. Queue cards in white with paper-300 border and warm left accent border (teal = mine, gold = flagged). Dual-view editor canvas: AI draft on warm paper-100 background, editor copy on pure white. Checklist items in ink-600 with teal checkmarks. Approve button in teal-600.

---

## PART 10 — DO'S AND DON'TS

### DO
- Use ink-950 as the primary CTA color — it is strong, trustworthy, and editorial
- Use teal-600 for interactive and editorial-trust contexts (links, focus, approve actions)
- Use gold only for trust signals — don't use it decoratively
- Maintain 2.0 line-height for all Arabic body text
- Use paper-50 as the default page background everywhere
- Give cards generous padding (24px minimum)
- Let white space breathe — sections need 80px+ top/bottom padding
- Use shadow-sm on cards at rest, shadow-md on hover
- Keep border radius at 16px for cards — friendly but not childish

### DON'T
- Don't use indigo, purple, or blue-violet anywhere in the product
- Don't use pure `#FFFFFF` as a page background — use `#FAFAF8`
- Don't use cold gray text — use warm ink tones
- Don't use tight line-height on Arabic text (min 1.7 for UI, 1.9 for body)
- Don't use neon, saturated, or high-contrast decorative colors
- Don't use `font-weight: 400` for headings — Arabic headings need 700+
- Don't stack more than 3 font sizes in one card component
- Don't use background gradients in cards — use flat surfaces with subtle borders
- Don't use animated gradients or moving backgrounds
- Don't use emojis as functional UI elements (only in content)
- Don't mix teal and gold in the same component — they serve different semantic roles

---

## PART 11 — ACCESSIBILITY

| Requirement | Value |
|---|---|
| Body text contrast (ink-600 on paper-50) | 7.2:1 ✅ |
| Primary text contrast (ink-950 on paper-50) | 17.5:1 ✅ |
| Teal on white contrast | 4.8:1 ✅ (AA) |
| Gold on white (text use) | ⚠️ 2.8:1 — use gold for decoration/icons only, not text |
| Minimum touch target | 44×44px |
| Focus ring | 2px teal-600, 2px offset |
| RTL | Full — all layouts mirror correctly |
| Font minimum (mobile) | 14px |

**Note on gold:** Gold (`#C9A84C`) does not meet WCAG AA for text on white. Never use gold as text color — only as icon/decoration color on light backgrounds.

---

*Design System v1.0 — Hikayati*
*Owner: Hassan Al-Alewee*
*Applied: globals.css, tailwind.config.js, button.tsx, StoryCard.tsx, ChildProfileCard.tsx*
