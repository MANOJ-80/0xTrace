# Landing page visual defaults

Use this reference when the requested landing-page work includes layout or visual styling. These are fallback choices for projects without an established design system; keep the project’s brand, tokens, components, and explicit user direction ahead of them. Skip this reference for copy-only edits.

## Fallback visual defaults

Use the project's existing design tokens, components, and brand assets when present. The following are fallback defaults for a new project without an established system; adapt them to the chosen framework instead of introducing Tailwind solely to match this guide.

## B1. Typography

### Fonts

**Fallback choices:** Geist, Manrope, Geist Mono, Poppins.

Do not replace an existing brand font just because it is not in this list. For a new project without a font direction, choose a readable, available typeface that fits the product.

Preserve intentional font pairing and italic styles in an existing system. For a new project, use a restrained type pairing; a monospace may support code or data.

Avoid heavy weights when they reduce readability or conflict with the brand.

### Copy rules

**Readable line breaks.** Avoid a lone word on the last line when practical. Use `text-wrap: balance` for headings and `text-wrap: pretty` for body copy where supported. Preserve meaning; do not force awkward copy or fixed widths just to remove an orphan.

### Type scale

Prefer the project's type scale. If none exists, use Tailwind's default type scale as a reference, adapted to the project's styling system. Keep custom sizes when they serve a clear responsive or brand need.

For a new project using this fallback scale, choose a nearby step that preserves the intended hierarchy. Do not change justified existing sizes solely to match the table.

| Class | Size | Line height |
|---|---|---|
| `text-xs` | 12px (0.75rem) | 16px |
| `text-sm` | 14px (0.875rem) | 20px |
| `text-base` | 16px (1rem) | 24px |
| `text-lg` | 18px (1.125rem) | 28px |
| `text-xl` | 20px (1.25rem) | 28px |
| `text-2xl` | 24px (1.5rem) | 32px |
| `text-3xl` | 30px (1.875rem) | 36px |
| `text-4xl` | 36px (2.25rem) | 40px |
| `text-5xl` | 48px (3rem) | 1 |
| `text-6xl` | 60px (3.75rem) | 1 |
| `text-7xl` | 72px (4.5rem) | 1 |
| `text-8xl` | 96px (6rem) | 1 |
| `text-9xl` | 128px (8rem) | 1 |

Keep size, line height, and tracking readable as a set; the table is a reference rather than a constraint on responsive typography.

### Button type

Use a readable button size with enough emphasis for its role; follow the project's component tokens where available.

## B2. Spacing

Prefer the project's spacing tokens. If none exist, this scale is a starting point, not a ban on responsive or content driven values.

| Token | Value |
|---|---|
| Spacing-0 | 0 |
| Spacing-25 | 2px |
| Spacing-50 | 4px |
| Spacing-75 | 8px |
| Spacing-100 | 12px |
| Spacing-200 | 16px |
| Spacing-300 | 24px |
| Spacing-400 | 32px |
| Spacing-500 | 40px |
| Spacing-600 | 48px |
| Spacing-700 | 64px |
| Spacing-800 | 80px |
| Spacing-900 | 96px |

**Main buttons:** use the project's control spacing; 8px vertical and 12px horizontal padding are starting values when none exist.

## B3. Corner radius

Prefer the project's radius tokens. If none exist, use a consistent small set of radii; Tailwind values are one possible reference.

**Optional nested radius heuristic.** When it suits the component, a shape inside another can use a smaller radius based on the gap between them:

```
inner radius = outer radius − gap
```

Use the result only when it fits the project's radius tokens and looks right; otherwise follow the existing component styles.

Example: an outer card at `rounded-2xl` (16px) with 8px of internal padding gives an inner element an 8px radius (`rounded-lg`).

## B4. Borders and backgrounds

- Use borders consistently within the project's component language.
- Use gradients only when they support the brand and contrast; avoid decorative effects that reduce legibility.

### Dark mode background colors

These are fallback dark surfaces when the project has no palette:

`#000000` · `#181818` · `#1F1F1F` · `#272727` · `#313131` · `#131209`

## B5. Hero section

### Heading color

- **Dark theme:** use high-contrast text from the project palette. A subtle left to right text gradient (`#FFFFFF` → `#9B9B9B`) is optional.
- **Light theme:** use high-contrast text from the project palette. A subtle left to right text gradient (`#000000` → `#666666`) is optional.

Use gradients only when they fit the project palette and preserve contrast; there is no required gradient placement.

### Layout

- Heading and subheading both get a **max width of 680px**.
- Read the heading copy and insert line breaks at **meaningful** points.
- Never break a line in a way that cuts a phrase awkwardly or makes the sentence harder to read. Break where the thought breaks.

## B6. Icons

**Fallback choices:** Phosphor, Solar, or Iconamoon. Prefer the icon set already used by the project.

Prefer the project's existing icon set. Avoid mixing icon families without a clear reason.

## B7. Motion

Motion should support hierarchy and remain responsive. Prefer the project's motion tokens; do not replace them just to match this guide.

**Base curve:** `ease-[cubic-bezier(0.22,1,0.36,1)]` with `duration-500` for layout and position changes. Color and opacity shifts on hover may use `duration-300`, never shorter than 200ms.

Animate only `transform` and `opacity`. Never animate `top`, `left`, `width`, or `height`.

Respect `prefers-reduced-motion`: replace movement with a plain opacity change.

### Navigation

**Resting state.** Follow the project's navigation pattern. A compact floating bar is one option when it suits the layout and does not reduce usability.

**Menu toggle.** The open and close icon transforms between its two states instead of swapping instantly. Use an icon from B6 or draw the lines yourself; either way the change is animated with the base curve.

**Mobile menu.** Choose a pattern that fits the navigation length and supports touch, keyboard, and screen reader use.

**Link entrance.** Staggered entrances are optional; keep them brief and avoid delaying access to navigation.

### Scroll reveals

Scroll reveals are optional. If they clarify hierarchy, keep them subtle, reveal content once, and respect reduced-motion preferences.

If scroll reveals are used, trigger them with `IntersectionObserver` or a framework equivalent. Avoid expensive work on every scroll event.

---

## B8. States

Implement states that match each control's behavior. A simple link does not need loading, empty, or error states; an asynchronous action does.

- **Hover and active** — use feedback that fits the control. Do not rely on hover for touch input.
- **Focus** — show a visible focus indicator for keyboard users.
- **Loading** — add it for actions or content that wait on a request. Use a skeleton when a content placeholder helps preserve layout; otherwise use a concise status.
- **Empty** — handle this when the page contains data-driven content that can be empty. Add a getting-started action when useful.
- **Error** — show a clear recovery message when an action or request can fail. Never use `window.alert()`.

Do not leave dead links. A button with no available action should be disabled or omitted. Indicate the current page in navigation when the deliverable has multiple routes.

## B9. Ship requirements

Apply these only when the corresponding route or feature is part of the requested site:

- Links to real privacy and terms pages when they exist or are required; never invent a legal destination or policy
- A 404 page when the site owns multiple routes or the requested scope includes not-found behavior
- Form validation when a form exists: validate its actual required fields and formats, show inline errors, and preserve entered values; server validation remains authoritative
- A skip-to-content link when the page has a main content region
- Cookie consent only when the applicable jurisdiction or project requirement calls for it
- A branded favicon when approved brand assets are available
- `<title>`, meta description, `og:image`, and social sharing tags for public pages intended for search or sharing; use a real, approved image
- Alt text for meaningful images; mark decorative images appropriately
- Semantic landmarks and elements that match the content present, such as `<nav>` and `<main>`; do not add empty or irrelevant landmarks
- A clear way back when the site has multiple routes

## B10. Optional tagline moment

Use a separate large type section only when it adds a useful emphasis beyond the hero. Do not force an extra section onto a short page or repeat the same claim.

**Copy**
- Minimum two lines of text.
- A benefit statement or tagline, written in the voice of the Copywriting section above, not a generic section heading.

**Typography**
- Size `text-4xl` to `text-6xl` depending on line count, following the B1 type scale.
- Max width capped like the hero, so lines break at meaningful points per B5.

**Animation**
- Keep the section static by default. Add motion only when it supports the chosen design and remains usable with reduced motion enabled.

---
