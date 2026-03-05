# UI Style Guide

This guide captures the design conventions used across the app's UI. Follow these patterns when building or updating components.

---

## Typography Scale

| Role | Classes | Usage |
|---|---|---|
| Eyebrow / section label | `text-xs font-semibold uppercase tracking-widest text-muted-foreground` | Labels above headings or sections (e.g., "ACTIVE CYCLE", "THIS WEEK'S LIFTS") |
| Page heading | `text-4xl font-bold tracking-tight leading-none` | Primary screen title |
| Sub-number | `text-5xl font-bold tabular-nums leading-none` | Large stat numbers (e.g., workout count) |
| Denominator | `text-xl font-medium text-muted-foreground` | Paired with sub-numbers (e.g., "/ 5") |
| Card label | `font-semibold` | Primary line in a list card |
| Card sublabel | `text-xs text-muted-foreground` | Secondary line in a list card |
| Highlighted value | `font-semibold text-foreground` | Key value inline in muted text |

---

## Color & Theming

All colors use CSS variables from `app/globals.css`. Never hardcode hex or HSL values — always use Tailwind semantic tokens.

| Token | Usage |
|---|---|
| `bg-background` / `text-foreground` | Page background and primary text |
| `bg-card` / `text-card-foreground` | Card surfaces |
| `bg-primary` / `text-primary-foreground` | Primary actions, filled pills, accent bars |
| `text-primary` | Accent text (icons, links, stat highlights) |
| `bg-muted` / `text-muted-foreground` | Disabled states, labels, secondary text |
| `bg-accent` | Hover background for interactive rows |
| `border` / `border-primary` | Default border / selected/active border |

### Opacity modifiers

Use slash-opacity for subtle tints rather than creating new colors:
- `bg-primary/8` — very subtle header gradient tint
- `bg-primary/10` — light tinted badge backgrounds
- `bg-primary-foreground/50` — dot inside a filled pill

---

## Spacing & Layout

- Max content width: `max-w-md mx-auto`
- Horizontal page padding: `px-4`
- Header top padding: `pt-8 pb-4`
- Section gap between cards: `mt-6`
- Card item list gap: `gap-2` (tight list) or `gap-3` (relaxed)
- Sticky bottom padding: `pb-6` with `pt-10` for gradient fade room

---

## Cards

Base card via `CardContainer` (`components/ui/card-container.tsx`):
```
bg-card text-card-foreground p-4 flex flex-col gap-6 rounded-xl border
```

For list-row cards (e.g., `WorkoutItem`), skip `CardContainer` and use inline classes:
```
flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5 transition-colors
```

### Left accent strip

Add a thin vertical bar as a visual state indicator on list cards:
```tsx
<div className={cn(
  'w-1 self-stretch rounded-full shrink-0',
  completed ? 'bg-primary' : 'bg-muted-foreground/30',
)} />
```

---

## Pills & Badges

| Variant | Classes | Usage |
|---|---|---|
| Filled primary | `rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground` | Current week, active state |
| Muted neutral | `rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground` | Counts, secondary info (e.g., "4 left") |
| Tinted primary | `rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary` | Success/complete state |

Filled pills may include a small dot indicator:
```tsx
<span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
```

---

## Section Headers

Two patterns depending on context:

**Eyebrow label** (above content sections):
```tsx
<h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
  This Week's Lifts
</h2>
```

**Eyebrow above page heading** (in page header area):
```tsx
<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
  Active Cycle
</p>
```

---

## Gradient Fade (Sticky Footer)

The sticky bottom action area uses a gradient to fade content behind it:
```tsx
<div className="sticky bottom-0 px-4 pb-6 pt-10 flex flex-col gap-2
  bg-gradient-to-t from-background via-background/95 to-transparent">
```

The header area uses a subtle primary tint at the top:
```tsx
<div className="bg-gradient-to-b from-primary/8 to-transparent">
```

---

## Buttons

Use shadcn `Button` with these conventions:

| Role | Variant | Additional classes |
|---|---|---|
| Primary CTA | `default` | `rounded-xl h-14 text-base font-semibold w-full` |
| Secondary action | `ghost` | `rounded-xl h-11 text-muted-foreground w-full` |
| Outline option | `outline` | `rounded-xl w-full` |

Primary CTA should always be the tallest button (`h-14`) and sit on top. Secondary actions use `ghost` to reduce visual weight.

---

## Icons

Use `lucide-react`. Standard sizes:
- `w-5 h-5` — list row icons (chevron, check)
- `w-6 h-6` — standalone status icons

| Context | Icon | Class |
|---|---|---|
| Incomplete list item | `ChevronRight` | `text-muted-foreground` |
| Completed list item | `CheckCircle2` | `text-primary` |

---

## Completed / Inactive States

Completed items in a list should be visually de-emphasized:
```tsx
className={cn(
  'font-semibold truncate',
  completed && 'line-through decoration-muted-foreground/50',
)}
// Wrap the whole item in:
completed ? 'opacity-60' : 'hover:bg-accent cursor-pointer'
```
