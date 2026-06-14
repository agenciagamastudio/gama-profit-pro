## Goal

Reduce duplication and inline CSS by (1) splitting the 538-line `src/routes/index.tsx` wizard into focused components, and (2) replacing every inline `var(--accent)` / `rgba(136,206,17,...)` arbitrary class with semantic Tailwind tokens already defined in `@theme inline` (`accent`, `accent-foreground`, etc.). No visual or behavioral changes.

## 1. Tokenize utilities (CSS-first)

Add small utility classes to `src/styles.css` so JSX stays clean:

- `.btn-accent` — `bg-accent text-accent-foreground rounded-full hover:opacity-90` (+ optional glow modifier via existing `.glow-sm/md`).
- `.orb-primary` / `.orb-secondary` — the two radial-gradient orbs currently inlined as `style={{ background: "radial-gradient(...)" }}` in `index.tsx`. Use `rgba(var(--gama-green-rgb), …)` so they follow the token.
- `.brand-dot` — green period after "Gama".

These plus existing `.glass*`, `.glow-*`, `.text-glow` cover all current inline styles.

## 2. Replace arbitrary classes with token classes

Project-wide find/replace (no visual change because tokens already map to the same OKLCH):

| Before                                              | After                            |
| --------------------------------------------------- | -------------------------------- |
| `text-[color:var(--accent)]`                        | `text-accent`                    |
| `bg-[color:var(--accent)]`                          | `bg-accent`                      |
| `text-[color:var(--accent-foreground)]`             | `text-accent-foreground`         |
| `border-[color:var(--accent)]`                      | `border-accent`                  |
| `hover:bg-[color:var(--accent)]`                    | `hover:bg-accent`                |
| `style={{ color: "var(--accent)" }}` (sidebar)      | `className="text-accent"`        |

Files touched: `src/routes/index.tsx`, `dashboard.tsx`, `fixed-costs.tsx`, `products.tsx`, `src/components/app-sidebar.tsx`.

## 3. Componentize `src/routes/index.tsx`

Create `src/components/pricer/` with:

```text
pricer/
  types.ts            Costs type, CATEGORIES, DEFAULT_MARGIN constants
  use-pricer.ts       Hook owning step/costs/name/category/image/margin state,
                      derived totalCost/suggested/profit, reset(), save()
  orb-backdrop.tsx    Two .orb-* divs (volumetric green glow)
  top-actions.tsx     Dashboard pill + Reset pill + ThemeToggle row
  brand-header.tsx    "Gama." mark + "Press · Precificação inteligente"
  step-indicator.tsx  Three segments + "01 / 03" counter
  cost-field.tsx      Label/hint + R$ input (extracted from index.tsx)
  metric.tsx          Small bordered stat card (extracted from index.tsx)
  step-one.tsx        Costs form
  step-two.tsx        Photo upload + name + category
  step-three.tsx      Result card with photo + suggested price + metrics
```

`src/routes/index.tsx` shrinks to ~60 lines: route definition + a `HomePricer` that calls `usePricer()` and composes the pieces. All sub-components consume tokenized classes from step 2.

## 4. Verification

- Read final `index.tsx` to confirm it's <80 lines and free of inline color values.
- Run `rg "\[color:var\(--accent" -g '*.tsx' src` — expect zero matches.
- Visual check: home `/`, `/dashboard`, `/products`, `/fixed-costs` render identically in dark and light mode.

## Out of scope

- No business logic changes (pricing formula, storage, routes).
- No new features, no copy changes.
- `app-shell`, `app-sidebar`, `theme-toggle` stay as-is aside from the token swap.
