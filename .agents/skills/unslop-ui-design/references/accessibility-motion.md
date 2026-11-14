# Accessibility and Motion Reference

Treat accessibility as a baseline quality requirement. Check the current WCAG version and product requirements rather than relying on memory alone.

## Review
- Text and interactive control contrast.
- Keyboard access to every interactive feature.
- Visible focus indicators.
- Semantic headings, landmarks, labels and button/link semantics.
- Form labels, instructions and understandable error messages.
- Status information not conveyed by color alone.
- Touch target size and spacing.
- Reflow at narrow viewports and browser zoom.
- Reduced-motion preference.
- No essential information available only on hover.
- Animation that can be paused, stopped or avoided where appropriate.

## Motion rules
Use motion to communicate state, cause/effect, spatial relationships or feedback. Prefer short, restrained transitions. Avoid perpetual decorative movement, forced scroll choreography, flashing, parallax by default, and motion that delays task completion.

Respect `prefers-reduced-motion`. Do not remove essential state feedback; provide a less animated equivalent.

## References
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- MDN accessibility: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility
- MDN prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
