# Talentforge

An AI-powered job matching platform. Two React single-page apps — a recruiter console for posting jobs and managing pipelines, and a seeker app for candidates to discover opportunities, track applications, and get career guidance. Backed by Supabase (Postgres, auth, realtime, storage) with Cerebras-hosted LLMs powering candidate-job scoring, resume parsing, job drafting, interview preparation, and career forecasting.

## Stack

- **Frontend**: React 19, Vite 6, TanStack Router + Query, Zustand, Tailwind 4, shadcn/ui
- **Backend**: Supabase (Postgres + GoTrue + Realtime + Storage), Edge Functions on Deno
- **AI**: Cerebras (Llama 3.3 / Llama 4 Scout via OpenAI-compatible API)
- **Monorepo**: pnpm workspaces + Turborepo

## Getting started

See [docs/setup.md](docs/setup.md) once it lands. Right now the repo is still being scaffolded — check the plan and phase progress for context.
