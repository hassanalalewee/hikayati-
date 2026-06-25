# حكايتي (Hikayati) — Setup Guide

## Prerequisites — Install These First

### 1. Node.js (REQUIRED — not currently installed)
Download and install from: **https://nodejs.org/en/download**
- Choose: **Windows Installer (.msi) — LTS version (v22.x)**
- Run the installer, click Next through all steps
- After install, open a NEW terminal and verify:
  ```
  node --version   → should show v22.x.x
  npm --version    → should show 10.x.x
  ```

### 2. Git (already installed ✓)

---

## Step-by-Step Setup

### Step 1 — Open Terminal in Project Folder
Right-click the `hikayati` folder → "Open in Terminal" (or PowerShell/CMD)

```
cd C:\Users\I776264\hikayati
```

### Step 2 — Install Dependencies
```bash
npm install
```
This installs ~500MB of packages. Takes 2-5 minutes.

### Step 3 — Set Up Supabase (Free)

1. Go to **https://supabase.com** → Sign up free
2. Click "New Project" → choose any name (e.g. "hikayati")
3. Wait ~2 minutes for project to provision
4. Go to: **Settings → API**
5. Copy these into `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`
6. Go to: **SQL Editor** → New Query
7. Open file: `supabase/migrations/001_initial_schema.sql`
8. Paste entire contents → Click **Run**

### Step 4 — Set Up AI APIs

**Anthropic (Claude) — Required for stories:**
1. Go to **https://console.anthropic.com**
2. Sign up → Billing → Add $5 credit
3. API Keys → Create Key
4. Copy to `.env.local` as `ANTHROPIC_API_KEY`

**OpenAI — Required for illustrations:**
1. Go to **https://platform.openai.com**
2. Sign up → Billing → Add $5 credit
3. API Keys → Create Key
4. Copy to `.env.local` as `OPENAI_API_KEY`

### Step 5 — Set Up Stripe (for payments — can skip for testing)

If you want to test subscriptions:
1. Go to **https://dashboard.stripe.com** → Sign up
2. Stay in **Test Mode** (toggle at top)
3. Developers → API Keys → copy both keys to `.env.local`
4. Products → Create these products:
   - "Hikayati Premium Monthly" — $14.99/month recurring
   - "Hikayati Family Monthly" — $24.99/month recurring
5. Copy each Price ID to `.env.local`
6. For webhooks in local dev: install Stripe CLI and run:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Step 6 — Run the Development Server

```bash
npm run dev
```

Open browser: **http://localhost:3000**

You should see the Hikayati landing page in Arabic!

---

## Quick Start (Minimum to see the app)

To see the app working with JUST Supabase (no AI, no Stripe):

1. Install Node.js
2. `npm install`
3. Set Supabase keys in `.env.local`
4. Run migration SQL in Supabase
5. `npm run dev`

The landing page, login, register, and dashboard will all work.
Story generation requires Claude + OpenAI API keys.

---

## File Structure Quick Reference

```
src/
├── app/
│   ├── (marketing)/page.tsx     ← Landing page
│   ├── (auth)/login/            ← Login page
│   ├── (auth)/register/         ← Register page
│   ├── (app)/dashboard/         ← Main dashboard (protected)
│   ├── (app)/stories/create/    ← Story creation wizard
│   ├── (app)/stories/[id]/      ← Story viewer
│   ├── (app)/upgrade/           ← Pricing / upgrade page
│   └── api/                     ← API routes
│       ├── auth/                ← Login, register, logout
│       ├── stories/generate/    ← Trigger AI story generation
│       ├── children/            ← Child profile CRUD
│       ├── subscriptions/       ← Stripe checkout
│       └── webhooks/stripe/     ← Stripe webhooks
├── lib/
│   ├── ai/
│   │   ├── agents/              ← 5 AI agents
│   │   └── pipeline/            ← Orchestrator
│   ├── supabase/                ← DB client (server + browser)
│   └── stripe/                  ← Stripe client
└── stores/wizard-store.ts       ← Story creation state (Zustand)
```

---

## Troubleshooting

**"Cannot find module" errors:**
```bash
npm install
```

**"Invalid Supabase URL" error:**
Check `.env.local` has correct Supabase URL (no trailing slash)

**Story generation fails:**
Check Claude API key has billing enabled at console.anthropic.com

**Port 3000 already in use:**
```bash
npm run dev -- --port 3001
```
Then open http://localhost:3001
