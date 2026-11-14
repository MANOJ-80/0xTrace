---
name: redesign-existing-projects
description: "Diagnose and visually upgrade an existing website or product interface when the user asks to polish or redesign it. For new landing pages or focused conversion and copy work, use landing-page-design; for accessibility conformance, use accessibility-audit; for other engineering issues, use frontend-quality; for requested animation, use design-to-motion. Works with any CSS framework or vanilla CSS."
---

# Redesign Existing Projects

This skill is a **diagnostic**. It finds what is wrong with an existing interface and fixes it in place.

Use it for visual upgrades to existing product interfaces and broad visual refreshes of existing sites. Use `landing-page-design` for new marketing pages or focused conversion, copy, and layout work. Use `frontend-quality` for functional defects and general engineering quality. Do not redesign from scratch unless the user asks for a rebuild.

For WCAG conformance, keyboard and screen-reader operation, or a full accessibility review, use `accessibility-audit`. This skill may flag visible contrast or focus concerns, but a source-only visual pass must not claim conformance or a confirmed accessibility violation.

**Anti-slop foundation.** Before designing or redesigning any UI, read `unslop-ui-design` SKILL.md §Guidance to absorb the anti-slop sign inventory, token defaults, and design principles. Apply them as you design — do not generate sloppy output only to fix it later. When using third-party design skills (Impeccable, Taste, etc.), read the same guidance section first for the same reason.

## Design system and fallback

Use the project's existing design tokens, components, and brand assets when present. The audit below helps identify user-facing problems; stylistic differences are not defects by themselves. Do not replace valid project values merely because they differ from a recommendation. If the project has no established system, read [fallback design values](references/design-values.md) and adapt them to its framework. Follow explicit user direction; ask only when a missing choice materially affects the result.

## How this works

1. **Scan** — Read the codebase. Identify the framework, styling method (Tailwind, vanilla CSS, styled-components, CSS modules), and the current design patterns.
2. **Inspect** — Review the rendered target screens at the relevant viewport and inspect their source and design tokens. Use an existing project browser or documented runner when available. Before the first browser interaction, briefly tell the user which available driver you selected and what visual checks it can perform. If rendering fails, follow [browser recovery](#browser-recovery) before falling back to source review; label those observations source-only and do not describe an unobserved visual result as fact.
3. **Diagnose** — Summarize the concrete usability, visual, or consistency issues that matter for the request. Label suspected accessibility concerns as needing verification unless you have the evidence required by `accessibility-audit`. Do not report every difference from this guide as a defect.
4. **Fix** — Continue with targeted upgrades inside the existing stack, prioritizing user impact and low regression risk. Preserve working behavior and the product's visual identity. Do not pause for approval on routine, reversible fixes within the user's request; ask only when a material product decision is unresolved.

For each material finding, give its route or component, evidence and inspection method, user impact, and a focused recommendation. Separate confirmed problems from hypotheses and optional style preferences. State relevant viewport or tool limits, and omit checklist items that are not problems.

## Browser recovery

Complete these checks before concluding that rendered inspection is unavailable:

1. Check the current browser-controller inventory and the project's existing browser or QA setup for the target URL, startup command, and required viewport. A browser binary alone is not a controllable driver.
2. Classify a failure as a driver/context problem, app startup problem, or navigation/rendering problem. If the selected driver fails, try another already-available driver or the project's documented runner and confirm it can control the browser and set the required viewport. Do not install tools or configure new browser infrastructure unless asked.
3. For app startup or navigation failures, inspect the documented command and error output. Retry only with a documented command or an evident local correction. Do not change project configuration or install dependencies as an improvised recovery.
4. If recovery fails, continue with source and token review where useful. Report the failed checks and recovery attempt, label visual conclusions source-only, and do not treat a tool or environment failure as an app defect.

---

# Design audit

## Typography

- **Unreadable or inconsistent typography.** Improve hierarchy using the project's existing font family and tokens before considering a font change.
- **Typefaces without a clear role.** Consolidate only when the pairing harms consistency or readability.
- **Italic or heavy type that harms readability.** Adjust only where it creates a concrete problem; preserve intentional brand use.
- **Only Regular (400) and Bold (700) in use.** If hierarchy is hard to distinguish and the font supports more weights, consider Medium (500) or SemiBold (600).
- **Headlines lack presence.** Adjust size or tracking only when it improves hierarchy and remains within the project's type scale.
- **Body text too wide.** If long lines make reading harder, use the project's container tokens; about 65 characters is a starting point, not a limit.
- **Numbers in a proportional font.** Consider `font-variant-numeric: tabular-nums` when readers compare values in a column or changing number.
- **Letter spacing.** Adjust tracking only when it improves readability or hierarchy; preserve the project's type tokens and existing brand style.
- **All caps subheaders everywhere.** If they reduce readability or conflict with the product's voice, follow the established case style. Do not replace them with italics by default.
- **Orphaned words.** Avoid a lone word on the last line when practical. Use `text-wrap: balance` on headings and `text-wrap: pretty` on body copy where supported; do not force awkward copy or widths to remove an orphan.
- **Copy with awkward or inconsistent line breaks.** Improve wrapping while preserving natural wording and punctuation.
- **Type sizes that break the established scale or hierarchy.** Prefer project tokens. Use the fallback scale only when no scale exists; retain justified responsive values.
- **Button type that conflicts with the project's hierarchy.** Align it with existing control styles.

## Color and surfaces

- **Colors that fail contrast or clash with the established palette.** Fix the concrete issue while preserving brand colors.
- **Decorative gradients or effects that harm contrast or hierarchy.** Simplify them when the design benefits; do not ban effects by default.
- **Accents that compete or feel inconsistent.** Refine their use against the project's palette rather than imposing a universal color count or saturation threshold.
- **Inconsistent neutral tones.** Align surfaces with existing theme tokens where appropriate.
- **Shadows that look heavy or disconnected from the palette.** Adjust their color and opacity against the surrounding surfaces; preserve intentional neutral shadows.
- **Surfaces that lack needed hierarchy.** Use existing elevation, borders, or surface tokens; texture is optional and should not be added decoratively by default.
- **Conflicting shadows within one surface system.** Align their direction and softness when it improves depth cues; preserve distinct elevation systems when the design calls for them.
- **A section whose surface breaks the page hierarchy.** Check whether the contrast is intentional and consistent with the product theme before changing it.
- **Sections that feel visually empty.** First check whether content or layout needs adjustment. Use project assets or approved licensed assets only; do not add third party image URLs or dependencies without approval.

## Layout

- **Everything centered and symmetrical.** Consider asymmetry only when it improves hierarchy or scanning. Do not add offsets or mixed ratios just to break symmetry.
- **Feature content repeated in identical cards.** Check whether the pattern fits the content; use a different layout only when it improves hierarchy or scanning.
- **`height: 100vh` on full screen sections.** If viewport changes cause clipping or jumps, use a supported dynamic or small viewport unit with an appropriate fallback.
- **Complex flexbox percentage math.** Consider CSS Grid when it makes the layout clearer or fixes a demonstrated sizing problem.
- **Content that is difficult to scan due to line length.** Use the project's container tokens; a 1200 to 1440px outer width can be a starting point for wide screens, with narrower text measures.
- **Cards forced to equal height by flexbox.** Keep equal heights when they aid comparison; allow content-driven heights when they improve reading and layout.
- **Radius or spacing that feels inconsistent.** Align values with the project's existing tokens. Use the fallback scale only when no system exists; adapt it to the framework.
- **Layering or spacing that obscures hierarchy.** Adjust depth and optical balance where the current layout feels flat or misaligned.
- **Dashboard navigation that does not fit its users or content.** Consider alternatives only when they improve common tasks.
- **Crowded or scattered spacing.** Adjust spacing to improve grouping and hierarchy. Preserve intentional density when users need to compare information.
- **Actions that are difficult to compare across cards.** Align them when it improves scanning and does not create awkward empty space.
- **Feature lists or controls that are hard to compare.** Align them when it improves scanning, without forcing equal-height layouts where content differs.
- **Inconsistent vertical rhythm across related elements.** Align baselines and spacing when it improves readability.
- **Mathematical alignment that looks optically wrong.** Icons beside text, play buttons in circles, and text in buttons often need one or two pixels of optical correction.

## Interactivity and states

- **Motion that feels inconsistent or blocks interaction.** Follow the project's motion tokens and keep transitions responsive.
- **Scroll effects implemented with costly listeners.** Prefer `IntersectionObserver` or framework facilities when scroll-triggered behavior is needed.
- **Navigation or menus that are difficult to use.** Improve them for the actual layout and touch targets; a floating or full-screen menu is not mandatory.
- **Motion ignores reduced-motion preferences.** Remove or reduce nonessential motion under `prefers-reduced-motion`; use a simple fade only when it remains appropriate.
- **No hover states on buttons.** Add hover feedback when it helps pointer users understand the control; do not rely on hover for touch or keyboard input.
- **No active or pressed feedback.** Add it when it clarifies activation and fits the existing component behavior.
- **Missing focus ring.** Visible focus indicators are an accessibility requirement, not a style choice.
- **No loading states.** Add them for async actions or content that waits on a request; use skeletons only when they represent the content being loaded.
- **No empty states.** Address them for data-driven areas that can be empty; add a getting-started action when useful.
- **No error states.** Add a specific recovery message where an action or request can fail. Never use `window.alert()`.
- **Dead links.** Buttons pointing at `#`. Link them or visually disable them.
- **No current page indicator in navigation.** Show it when the site has multiple routes and an active location helps users orient themselves.
- **Scroll jumping.** Consider smooth anchor navigation when it helps; honor reduced-motion preferences and preserve expected browser behavior.
- **Frequently animating layout properties.** If it causes measured jank, consider `transform` or `opacity` and verify the result. Do not assume either is always faster or GPU accelerated.

## Content

- **Unverified people, customer brands, or testimonials.** Do not invent names, faces, logos, endorsements, or quotes. Omit them or use clearly marked prototype placeholders.
- **Unverified numbers, prices, dates, or promises.** Use only supplied or verified facts; never add artificial precision to make a claim look real.
- **Filler marketing words.** Cut "revolutionize", "supercharge", "cutting edge", "effortless", "transform your workflow", "take it to the next level", "harness the power", "world class". Say what the product actually does.
- **Vague value propositions.** Make the copy more specific using verified product facts; do not invent measurable outcomes.
- **Features listed with no outcome.** Every feature line should state what it means for the user.
- **Unclear CTAs.** Use a clear action that reflects the real next step and offer.
- **Competing CTAs above the fold.** One primary action per page.
- **Available proof separated from its claim.** Keep verified testimonials, logos, and numbers near the claims they support.
- **Risk claims that are absent or unsupported.** Add only when there is a real, approved offer or policy to describe.
- **Loud or cute system messages.** Confirmations should be calm and specific ("Invoice sent to Dana"). Errors should name what failed and the next step ("Upload failed. The file is over 20 MB."). No exclamation marks, no interjections.
- **Passive voice.** Name who did what: "We couldn't save your draft."
- **Placeholder text.** Any "Your headline here" or Latin filler is a blocker. Write real draft copy.
- **Title Case everywhere.** Use sentence case for headings and buttons.

## Component patterns

- **Generic card look: border plus shadow plus white background.** Drop to background color alone, or spacing alone. Cards should exist only where elevation communicates hierarchy.
- **A border treatment that looks inconsistent with its component.** Align it with the design system; single-side borders can be intentional.
- **Button groups with unclear hierarchy.** Use the project's button variants to make action priority clear.
- **Badges that are hard to scan or inconsistent with the system.** Use the project's established badge treatment; do not change a pill shape just for variety.
- **FAQ that is irrelevant or unnecessarily long.** Keep only questions that answer real user concerns and follow the product's content patterns.
- **Testimonials presented in a way that is hard to read.** Improve the display of verified quotes; do not add or imply endorsements that are not supplied and approved.
- **Pricing plans that are hard to compare.** Improve hierarchy using the product's existing patterns. Mark a recommended tier only when the product actually recommends one.
- **Modals for everything.** Use inline editing, slide over panels, or expandable sections for simple actions.
- **Theme controls that are hard to understand.** Keep their label and behavior clear; change the control pattern only when it solves an observed problem.
- **Footer links that are hard to scan.** Group links by user task while preserving required legal and product destinations.

## Iconography and imagery

- **Inconsistent iconography.** Prefer the project's current icon set and replace icons only when they create a concrete consistency or usability issue.
- **Icons that rely on confusing or clichéd metaphors.** Choose an icon that communicates the actual action or concept.
- **Inconsistent icon weights.** Align weights within the same icon family when the mismatch distracts or reduces recognition.
- **Missing or broken favicon.** Address it only when site identity is in scope and an approved brand mark is available.
- **Generic stock team photos.** Replace them only when they conflict with the product or imply real people or customers without approval. Use approved images or a consistent illustration style.

---

# Fix priority

Maximum visual impact, minimum risk, in this order:

1. **Critical usability and accessibility issues** — keyboard access, focus visibility, contrast, broken responsive behavior
2. **High impact visual hierarchy issues** — improve layout, type, and surfaces within the project system
3. **Interaction feedback and missing states** — align with existing component patterns
4. **Content clarity** — improve copy only with verified product facts
5. **Polish** — motion, icons, and details where they support the design

---

# Rules

- Work with the existing tech stack. Do not migrate frameworks or styling libraries.
- Do not break existing functionality. Verify relevant changes using the project's available checks.
- Briefly report the diagnosis as work proceeds, then apply fixes within the requested scope. Pause only for a material decision that cannot be inferred safely.
- Check the project's dependency file before importing any new library.
- If the project uses Tailwind, check the version, v3 or v4, before touching config.
- If there is no framework, use vanilla CSS.
- Keep changes reviewable and focused. Small targeted improvements over big rewrites.
- Preserve established design values. If the project has no system, use [fallback design values](references/design-values.md) as a starting point and adapt them to the current stack.
- Keep implementation review limited to code needed for the requested visual changes. Use `frontend-quality` for broader engineering or SEO reviews and the specialist skills named above for security, accessibility, and performance audits.

---

## Credits

Parts of this skill were adapted from [taste-skill](https://github.com/Leonxlnx/taste-skill) by Leon Lin ([@LexnLin](https://x.com/LexnLin)), MIT licensed. Its redesign audit structure, content realism checks, and motion and navigation ideas informed the matching sections here, which have since been rewritten.

<details>
<summary>taste-skill license</summary>

```
MIT License

Copyright (c) 2026 Leonxlnx

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
</details>
