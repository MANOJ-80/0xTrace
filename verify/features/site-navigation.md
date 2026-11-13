# Site navigation

A visitor moves between the archive's top-level pages with the desktop navbar, the mobile menu, and the footer, and can tell which page is current.

- ID: site-navigation
- Priority: high
- Status: verified
- Surfaces and roles: web / public visitor
- Source evidence: `apps/web/src/components/Navbar.tsx`, `apps/web/src/app/layout.tsx`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- Desktop navbar links.
- Mobile menu toggle and links.
- Footer navigation.

## Checks

- `nav-desktop` in `verify/flows/nav-desktop.json` — each top-level link reaches its page and the active item is marked.
- `nav-mobile` in `verify/flows/nav-mobile.json` — the menu opens, lists the same destinations, closes after a selection, and exposes `aria-expanded`.

## Behavior variants

- Signed-in navbar adds Contribute, My Experiences, and possibly Admin. Not reachable without a session.
- Active state for nested routes such as a record detail page.
- Keyboard operation of the menu toggle.
- Footer links at both viewports.

## Gaps and assumptions

- The signed-in link set is source-derived only.
- The mobile menu is a dropdown, not a full-screen overlay; it does not trap focus.
