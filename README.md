# SPOS — Startup Prompt Operating System

Transform raw startup ideas into world-class assets using AI.

## Tech Stack

- **Frontend + API**: Next.js 15 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui primitives  
- **Auth + DB**: Supabase (PostgreSQL + Realtime)
- **AI**: Anthropic Claude Sonnet 4 (generation) + Claude Haiku (evaluation)
- **Background Jobs**: Trigger.dev (replaces BullMQ — serverless, no separate server)
- **Payments**: Stripe
- **Hosting**: Vercel

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd spos
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` and keys — from Supabase project settings
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `TRIGGER_SECRET_KEY` — from trigger.dev project
- `STRIPE_SECRET_KEY` — from stripe.com dashboard

### 3. Set up Supabase

1. Create a new project at supabase.com
2. Go to SQL Editor and run `supabase/schema.sql`
3. Enable Google OAuth in Authentication > Providers
4. Copy URL and keys to `.env.local`

### 4. Set up Trigger.dev

1. Create account at trigger.dev
2. Create a new project
3. Copy secret key to `.env.local`
4. Run `npx trigger.dev@latest dev` alongside `npm run dev`

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
spos/
├── app/
│   ├── (auth)/          # Login, signup pages
│   ├── (dashboard)/     # Protected dashboard routes
│   └── api/             # API routes (idea analysis, generation)
├── components/          # Reusable UI components
├── lib/
│   ├── ai/             # Idea parser, prompt composer, quality evaluator
│   ├── db/             # Database queries
│   ├── supabase/       # Supabase client/server utils
│   └── templates/      # Domain prompt templates
├── trigger/            # Trigger.dev background job definitions
├── types/              # TypeScript types
└── supabase/           # Database schema + migrations
```

## Adding a New Domain Template

1. Create `lib/templates/{industry}/investor-narrative.ts`
2. Export a `PromptTemplate` object (see `healthtech` for reference)
3. Add it to `lib/templates/index.ts` TEMPLATES array

## Adding a New Deliverable Type

1. Add the type to `types/index.ts` `DeliverableType`
2. Add config to `DELIVERABLE_CONFIGS` array
3. Create templates for key industries
4. Update the `generate` API route's Zod schema

## Deployment

```bash
vercel deploy
```

Set all env vars in Vercel dashboard. No additional server needed — 
Trigger.dev handles background jobs serverlessly.

## Costs (MVP, 0-100 users)

| Service | Tier | Monthly |
|---|---|---|
| Vercel | Hobby (free) | $0 |
| Supabase | Free | $0 |
| Trigger.dev | Free (50K runs) | $0 |
| Anthropic API | Pay per use | ~$30-80 |
| Stripe | 2.9% + 30¢ | On revenue |

**Total infra: ~$0-80/month**
