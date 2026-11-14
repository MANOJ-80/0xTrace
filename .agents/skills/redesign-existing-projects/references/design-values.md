# Redesign fallback design values

Read this only when the project has no established design system. These are adaptable starting points, not requirements; use the project’s framework and preserve the user's direction.

**Fonts:** Geist, Manrope, Geist Mono, Poppins are starting options. Choose a readable font that suits the product and is available in the project. Preserve intentional font pairings and styles.

**Dark backgrounds:** fallback options are `#000000` · `#181818` · `#1F1F1F` · `#272727` · `#313131` · `#131209`

**Hero heading:** use high contrast from the chosen palette. A text gradient is optional when it fits the product and maintains contrast.

**Spacing:** 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96px. Main buttons 8px vertical, 12px horizontal.

**Radius:** use a small consistent set of radii. Tailwind values are an example, not a requirement.

**Icons:** prefer the project's current icon set. For a new project, Phosphor, Solar, or Iconamoon are options.

**Motion:** base curve `ease-[cubic-bezier(0.22,1,0.36,1)]`, `duration-500` for movement, `duration-300` for color and opacity. Scroll reveals 600 to 800ms via `IntersectionObserver`. Respect `prefers-reduced-motion`.

**Type scale:** use a coherent scale adapted to the project's framework. Tailwind's scale is one reference.

| Class | Size | Line height |
|---|---|---|
| `text-xs` | 12px | 16px |
| `text-sm` | 14px | 20px |
| `text-base` | 16px | 24px |
| `text-lg` | 18px | 28px |
| `text-xl` | 20px | 28px |
| `text-2xl` | 24px | 32px |
| `text-3xl` | 30px | 36px |
| `text-4xl` | 36px | 40px |
| `text-5xl` | 48px | 1 |
| `text-6xl` | 60px | 1 |
| `text-7xl` | 72px | 1 |
| `text-8xl` | 96px | 1 |
| `text-9xl` | 128px | 1 |

---
