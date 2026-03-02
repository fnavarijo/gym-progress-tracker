# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server (localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run test       # Run Jest tests
npm run test:watch # Run Jest in watch mode
```

## Environment Setup

Copy `.env.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # Can also use legacy ANON key here
```

## Architecture

**Stack:** Next.js (App Router) + Supabase (auth + database) + Tailwind CSS + shadcn/ui

### Supabase Client Pattern

Two separate clients must be used depending on context:
- **Client components** (`'use client'`): `createClient()` from `@/lib/supabase/client.ts`
- **Server components / Route handlers**: `createClient()` from `@/lib/supabase/server.ts`

Never use the server client in a browser context or the browser client in a server context. The server client creates a new instance per call (intentional — avoids issues with Fluid compute).

### Route Protection

`proxy.ts` (root) is the Next.js middleware. It calls `updateSession` from `@/lib/supabase/proxy.ts` on every request to refresh the Supabase session cookie. Unauthenticated users are redirected to `/auth/login`.

### App Structure

```
app/
  auth/          # Public auth pages (login, sign-up, forgot-password, update-password, confirm)
  progress/
    start/       # Select cycle duration (4/5/6 weeks)
    register/    # Add exercises and track PR percentages (client component with local state)
  loginHome/     # Post-login home
  plans/         # Subscription/plans page
  protected/     # Server component showing authenticated user info
```

### UI Components

Uses **shadcn/ui** (new-york style, neutral base) on top of Radix UI primitives. Components live in `components/ui/`. Add new shadcn components via:
```bash
npx shadcn@latest add <component>
```

Custom app components go in `components/app/`. The `cn()` utility from `@/lib/utils` merges Tailwind classes (clsx + tailwind-merge).

### Theming

Dark/light mode via `next-themes`. All colors are CSS variables (HSL format) defined in `app/globals.css` and referenced in `tailwind.config.ts`. The `ThemeProvider` is set up in the root layout.

### Path Aliases

`@/*` maps to the project root. Use `@/components`, `@/lib`, etc. for imports.

## Testing

**Framework:** Jest + `@testing-library/react` (configured via `next/jest`). Test files live in `__tests__/` subdirectories next to the module they test and use the `.spec.ts` extension.

**TDD for `api/` functions:** Always write tests before implementing any function in the `api/` folder. Write failing tests first, then implement to make them pass.

### Mocking pattern

```ts
jest.mock('@/lib/supabase/server');
const mockCreateClient = jest.mocked(createClient);

// Build a fluent mock matching the actual query chain, e.g.:
const order = jest.fn().mockResolvedValue({ data, error });
const eq    = jest.fn().mockReturnValue({ order });
// ...
mockCreateClient.mockResolvedValue(mockSupabase as never);
```
