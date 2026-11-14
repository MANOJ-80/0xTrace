# Final review

## Anti-slop checklist
- [ ] The direction is written and every pass follows it
- [ ] Every spacing value is on the 4px scale and equal things have equal sizes
- [ ] Icons, labels and numbers each sit in one aligned column
- [ ] One tinted neutral ramp, three text roles, one accent with enough contrast
- [ ] No hue gradients, gradient text, glows, colored shadows or color blobs
- [ ] No emoji left in the interface
- [ ] One icon set at one size and stroke
- [ ] Type chosen for the character, weights 400 to 600, no uppercase tracked labels, no italic, no negative tracking on small text
- [ ] No exclamation marks, no trailing periods on short strings, no greeting headline, no unverified claims
- [ ] Numbers in one format with tabular figures
- [ ] Nested radii add up
- [ ] A hero has a real visual or a product preview with at least one moment, never filler and never a labeled placeholder
- [ ] The first screen is composed as a whole with no dead empty band
- [ ] No looping or bouncy motion, one easing curve, no animated layout properties
- [ ] Template check. If you swapped the product name for another product's, would the screen still fit? If yes, push the direction harder in the copy, the visual and the signature detail

## Design review

Mark each item Pass, Needs work, or Not applicable. Explain failures; do not treat the checklist as a mechanical aesthetic score.

### Product and art direction
- [ ] Product, audience and primary task are understood.
- [ ] Visual direction fits product personality and context.
- [ ] Typography, color, layout, imagery and motion form a coherent system.
- [ ] No trend is used solely because it is popular.

### Hero and content
- [ ] Hero explains the actual product or user value.
- [ ] Headline and line breaks read naturally.
- [ ] Eyebrow labels and badges provide useful context.
- [ ] CTAs are specific and functional.
- [ ] Claims, statistics, logos and testimonials are authentic.
- [ ] Each section contributes distinct information.

### Layout and components
- [ ] Layout follows content and user tasks.
- [ ] Cards and grids are used when they improve grouping.
- [ ] Repetition is intentional rather than template-driven.
- [ ] Spacing, radius, borders and elevation are consistent.
- [ ] Icons and badges are meaningful and restrained.

### Interaction and motion
- [ ] Every visible control works.
- [ ] Hover, focus, active, disabled and loading states are considered.
- [ ] Motion communicates state or useful relationships.
- [ ] Reduced-motion preference is respected.
- [ ] Keyboard navigation works.

### Responsive and accessibility
- [ ] Desktop, tablet and mobile layouts are inspected.
- [ ] No horizontal overflow or clipped content.
- [ ] Typography remains readable.
- [ ] Contrast is sufficient.
- [ ] Controls have accessible names and semantics.
- [ ] Color is not the only way information is conveyed.
- [ ] Empty, error and success states are handled.

### Engineering
- [ ] Design tokens are used consistently.
- [ ] No unnecessary dependencies or fragile overrides.
- [ ] No fake data or placeholder links remain.
- [ ] Rendered UI has been inspected when possible.
- [ ] High-impact issues are fixed before decorative polish.

## Quality gate
Before delivery, ask:
- Does this look like it belongs to this product?
- Can users understand what it does quickly?
- Is every major visual decision justified?
- Is any section present only because a template expects it?
- Are repeated patterns making the page feel generated?
- Is content truthful and specific?
- Does the interface work on mobile and desktop?
- Are keyboard, contrast and reduced-motion needs addressed?
- Have I inspected the rendered result, not just the code?

---

**Sources:** Anti-slop checklist from [unslop](https://github.com/heydamir/unslop) by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0. Design review and quality gate from the unslop-design pattern inventory.
