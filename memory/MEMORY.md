# Project Memory

## Workflow Preferences

- **TDD for API routes**: Always write tests first when working in the `api/` folder. Write failing tests, then implement the handler to make them pass.

## Stack

- Next.js (App Router) + Supabase + Tailwind CSS + shadcn/ui
- Testing: Jest + @testing-library/react (configured via `next/jest`)

## Key Patterns

- Two Supabase clients: `@/lib/supabase/client.ts` (browser) and `@/lib/supabase/server.ts` (server). Never mix contexts.
- shadcn/ui components in `components/ui/`, custom app components in `components/app/`
- Path alias: `@/` maps to project root
