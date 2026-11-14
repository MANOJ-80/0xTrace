---
name: landing-page-design
description: "Build new conversion-focused landing pages or make focused conversion, copy, or layout changes to a landing page. For broad visual upgrades to existing interfaces, use redesign-existing-projects; for WCAG conformance or a dedicated accessibility review, use accessibility-audit; for other behavior and code-quality issues, use frontend-quality; for requested showcase or section animation, use design-to-motion."
---

# Landing Page Design

A landing page is not a homepage. A homepage serves multiple intents. A landing page wins one intent:

**one offer → one audience → one primary action.**

This skill separates conversion strategy and copy from visual defaults. Work through strategy before visual styling, and use an existing project design system or explicit user direction ahead of fallback defaults.

## Scope

Use this skill for new marketing landing pages and conversion-focused marketing sections. For an existing marketing page, apply it only to the requested conversion, copy, or layout work. Do not treat dashboards, settings screens, general product components, or unrelated prototypes as landing pages. Use `redesign-existing-projects` for broader visual upgrades to an existing interface, `accessibility-audit` for WCAG conformance or a dedicated accessibility review, `frontend-quality` for other behavior and code-quality work, and `design-to-motion` only when motion is requested. Apply core accessibility requirements while building, but leave conformance audits to `accessibility-audit`. For a focused section task, inspect only relevant product facts and ask only for information that materially changes the result. For a full-page build, read [full-page strategy](references/full-page-strategy.md) for the intake, structure, layout, build order, and SEO guidance. Preserve the project's existing brand and design system. When the user's explicit prompt conflicts with a recommendation, follow the user.

**Companion skill.** For a broad visual upgrade to an *existing* interface, use `redesign-existing-projects` ([github.com/elayadesign/redesign-skill](https://github.com/elayadesign/redesign-skill)). That skill owns the existing-interface diagnosis and preserves the project's visual system. This skill contributes conversion goals, copy, and page structure only when those are part of the request.

**Anti-slop foundation.** Before designing or redesigning any UI, read `unslop-ui-design` SKILL.md §Guidance to absorb the anti-slop sign inventory, token defaults, and design principles. Apply them as you design — do not generate sloppy output only to fix it later. When using third-party design skills (Impeccable, Taste, etc.), read the same guidance section first for the same reason.

---

## Part A — Strategy and structure

For a full-page build, follow the [full-page strategy](references/full-page-strategy.md). Keep these conversion rules and copy guidance in scope for both full-page and focused section work.

## Conversion rules

**Match message to source.** If traffic comes from ads, mirror the ad headline in the hero and keep the same promise and visual tone.

**Make the next step obvious.** One primary CTA. Never place competing CTAs above the fold.

**Write benefit first.** Features are what it does. Benefits are what that means for them.

**Be specific.**
- ❌ "Save time and streamline"
- ✅ State a concrete outcome only when product evidence supports it; otherwise describe the verified capability plainly.

**Reduce risk.** Explain a real, approved term such as a free trial or cancellation policy when one exists. Never imply a guarantee, price, or offer that has not been verified.

**Address real objections.** Use concise copy or an FAQ when it helps. Put verified proof beside the claim it supports.

## Copywriting

**Headline formulas**
- "{Outcome} without {pain}"
- "The {category} for {audience}"
- "Ship {result} in {time}"

**Subheadline.** One or two sentences. Clarify what it is and who it is for.

**CTA.** Use a clear verb that matches the actual next step. Labels such as "Learn more" are fine when they accurately describe the destination; do not promise a trial, demo, or download unless it exists.

**Benefit bullets.** Lead with the outcome and support it with a verified capability, detail, or proof. Do not invent a feature to complete the example.

Note: use clear, natural copy and avoid awkward line breaks. Do not rewrite correct wording merely to remove punctuation.

## Content realism

Use factual content. Do not fabricate product capabilities, customer proof, people, company names, prices, performance numbers, dates, testimonials, guarantees, or legal terms.

- **Write the copy.** No placeholder Latin, no "Your headline here". Draft real sentences in the product's voice.
- **People and brands.** Use names, faces, logos, and testimonials only when supplied or verified and approved for use. Otherwise omit them or mark prototype content clearly.
- **Numbers and terms.** Use verified prices, metrics, dates, and offer terms. Do not make a claim appear authentic by adding artificial precision.
- **Banned filler words.** Do not write "revolutionize", "supercharge", "cutting edge", "effortless", "transform your workflow", "take it to the next level", "harness the power", or "world class". Say what the product does in plain terms instead.
- **Sentence case** for headings and buttons.
- **System messages.** Confirmations are calm and specific ("Invoice sent to Dana"). Errors say what failed and what to do next ("Upload failed. The file is over 20 MB."). No cute interjections, no exclamation marks.


---

## Visual defaults

For layout or visual-styling work, read [visual defaults](references/visual-defaults.md) after checking the project’s design system. Skip it for copy-only edits. The reference contains fallback choices, not requirements that override the project’s brand or the user’s direction.

## Execution and delivery

For a new landing page, use the [full-page strategy](references/full-page-strategy.md), the copy guidance here, and the [visual defaults](references/visual-defaults.md) when visual implementation is in scope. Build the page in the same task. Do not stop after presenting a plan, require approval for routine choices, or dump all proposed copy before coding unless the user asks for a plan or copy draft only.

Use reasonable assumptions for low impact choices. Ask only when a missing product fact or requirement materially changes the page and cannot be shown as a clearly marked prototype placeholder. In the final response, briefly state what you built, any material assumptions or placeholders, and the index/SEO decision when relevant.

## Preview and recovery

- Before the first browser interaction, briefly name the available driver you selected and the desktop/mobile viewports you will check.
- Start or open the app with its documented project command. Inspect the rendered page at supported desktop and mobile widths; confirm the actual viewport, primary CTA destination, navigation and form behavior when present, overflow, focus visibility, and reduced-motion behavior when motion is used. This page-level check does not replace a reusable flow plan; use `user-journey-qa` for multi-step journey coverage.
- If the browser or app fails, distinguish a driver/context failure from startup or page behavior. Check the project's existing QA setup and other already-available drivers, then retry only after a documented or evident safe correction. Do not install tooling or dependencies as an improvised recovery.
- If rendered inspection remains unavailable, continue source review and existing project checks. Report the failed recovery attempt and mark rendered layout and interaction behavior unverified; do not report a tool failure as a page defect or claim a visual check passed.

---

## Quick checklist

Apply only the sections relevant to the requested scope. Use the visual reference for layout or styling checks.

**Strategy**
- [ ] One offer, one audience, one primary action
- [ ] No competing CTAs above the fold
- [ ] Specific, verified product facts instead of vague claims
- [ ] Offer terms and risk reversals are verified
- [ ] Available proof sits next to the claim it supports; no proof has been invented
- [ ] Layout type chosen deliberately

**Visual**
- [ ] Existing brand fonts, type, spacing, radius, and icon tokens are preserved
- [ ] Typography and line breaks are readable at supported viewport sizes
- [ ] Decorative effects and motion support the design and respect reduced motion
- [ ] Hero heading and subheading have a readable measure and meaningful line breaks

**Content and ship**
- [ ] Copy is clear and factual; names, proof, and numbers are verified or visibly marked as prototype placeholders
- [ ] Each control has the states its behavior needs; keyboard focus is visible
- [ ] No dead links, current nav item indicated
- [ ] Include route, form, legal, favicon, metadata, and image requirements only when relevant to the deliverable; legal destinations and claims are real

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
