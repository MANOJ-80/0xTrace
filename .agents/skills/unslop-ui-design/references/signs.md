# Signs and patterns

## How to use this file

This file combines two complementary references.

**Part 1 — Quick-scan signs.** Concrete "if you see it, fix it" items from Damir Sokolovsky's _unslop_ skill. Each sign is paired with its fix, grouped by category. Scan these first during any review pass.

**Part 2 — Deep pattern inventory.** All 161 recurring generic-UI patterns catalogued as review triggers, not bans. A pattern is problematic when it is unearned, repetitive, misleading, inaccessible, or disconnected from the product context. Use this inventory for deeper audits and when you need to explain _why_ something feels off.

---

## Part 1 — Quick-scan signs

Go through every group and note each sign you find with where it lives. Each line pairs the sign with its fix.

### Surfaces and color

- Purple to blue or violet to pink gradients on backgrounds, cards, buttons or the active nav item → one neutral surface, accent only where it means something
- Gradient text in headings, numbers or the logo → solid primary text color
- Colored glows, like `shadow-[0_0_20px_rgba(139,92,246,0.5)]`, `drop-shadow` on emoji or glowing pills → remove, depth from surface steps and hairlines
- Radial color washes or blurred blobs behind content → remove
- Neon or high contrast colored borders → hairline at 6 to 10% opacity
- Many near identical tints of the same hue for text, like five lavenders → three text roles from one neutral ramp
- Every element highlighted, so nothing stands out → one accent used once or twice per screen
- Glass cards with a white inner highlight and a colored shadow → plain raised surface with a hairline

### Type

- Headings at weight 800 or 900 → 400 to 500 and size for hierarchy
- Uppercase labels with wide tracking, like `NAVIGATION` or `PAID THIS MONTH` → sentence case at normal or slightly open tracking
- Too many sizes and weights on one screen → a few sizes from the scale, weights 400 and 500
- Numbers in mixed formats, like `$48,210` next to `$124,860.40`, or `07` → one format, tabular figures
- Negative letter spacing on small text → zero or slightly positive
- Italic used for emphasis → color or weight instead

### Icons

- Emoji as nav icons, label decoration or status, like 🏠 📥 🚀 💰 ⚠️ 📈 🔥 😬 → one line icon set or nothing
- Emoji inside pills and counts, like `18 👤` → plain number
- Icons in many sizes and colors → one size, one stroke, text role color
- Icons nudged off the column → same icon box width in every row
- A sparkle ✨ for anything AI → remove or use a plain icon only where it explains something

### Spacing

- Arbitrary values, like `mt-[13px]`, `ml-[7px]`, `h-[31px]` → steps on the 4px scale
- Rows in one list with different heights or gaps → one height, one gap
- Groups that sit closer to their neighbours than to their own items → smaller gaps inside groups, bigger between them
- Uneven padding inside sibling cards → one padding
- Big empty gaps above a section and cramped space below it → balanced rhythm

### Copy

- Greeting headlines, like `Welcome back, Damir! 👋` → the page or period as the title
- Exclamation marks and `!!` → plain statement
- Changes without a reference, like `+12%!!` or `3 less!!` → `+12% vs last month`, `3 fewer vs last month`
- Wordy placeholders, like `Search anything...` → `Search`
- Hype words, like supercharge, seamless, unlock, magic, revolutionize → what the thing actually does
- Trailing periods on labels and buttons → none
- Fake looking data, like `$123,456` or `[X]` → plausible numbers

### Components

- Glowing pills for counts, plans, shortcuts or status → quiet mono text or a keycap
- `PRO`, `New ✨`, `Beta 🚀` badges everywhere → remove or one quiet text badge
- Every element a full pill, from search to buttons to cards → radius by size, nested radius math
- Charts with rainbow bars, glowing bars, pill shaped bars or uppercase day labels → one or two series, muted grid and mono labels, one highlight color
- Every chart or stack in several shades of the accent, so nothing leads → neutral steps with the accent only on the one thing that matters
- Sparklines, tallies or mini bars added to every stat card → the number, its label and its change
- Equal cards side by side, each with the same chart or layout → one main chart, compact stats, varied widths
- Logo as a gradient tile with a sparkle and a gradient wordmark → product name as text plus a simple flat mark
- Logo mark as a glossy orb, a gradient ball or a glowing dot → a flat glyph in one solid color, or the wordmark alone

### Landing pages and heroes

- A pill badge above the headline, like `✨ Introducing X 2.0` → remove, or a quiet text link if it is real news
- A headline that could fit any product, like `Supercharge your workflow with AI` → say what the product does for whom
- Gradient or shimmer on the headline → solid text
- Floating blobs, orbs, grids and glowing lines behind the hero → plain background or one real product visual
- Everything stacked and centered, headline, text, buttons and a picture below → an asymmetric split or text over a large product view, see the Layout pass
- Three or more buttons, or chips and avatars stacked under the buttons → one primary and at most one secondary action
- `Trusted by 10,000+ teams`, `Loved by 10,000+`, rows of avatar dots or five stars without a source → ask if it is real, then make it quiet and specific or remove it
- Parallax and elements floating on scroll → static layout, motion only with a purpose
- Feature cards with an emoji, a bold title and a vague line each → fewer features, concrete copy, line icons or none

### Visuals

- Glossy 3D blobs, orbs, liquid chrome shapes or a purple nebula as the hero visual → the product itself or one concrete metaphor for what it does
- Stock robots, glowing brains, circuit lines or holograms for anything AI → remove, or show what the AI actually produces
- Text, fake buttons or a fake logo baked into an image → real text in the page, a clean image without text
- An image that does not blend into the page, with a hard edge and a different black → background matched to the page and a soft mask at the edges
- A visual on every section → one visual where it helps, usually only the hero

### Motion

- `animate-pulse`, `animate-ping` or breathing glows on things that are not live → static
- `transition-all` and `hover:scale` on cards and buttons → color or surface step on hover, a tiny scale down on press
- Bouncy springs and overshoot on simple UI → one ease-out curve
- Everything flying in on load from different directions → one short fade and rise with a small stagger
- Parallax, floating loops and elements that move on scroll → static layout
- Animating width, height, top or left → transform and opacity

### Template look

These are not slop, but they are what a cleaned up screen falls back to when nobody made a decision. Watch for them after the passes.

- Pure grey #161616 page, Inter, white text and the old brand color on one button, on a product whose world is warm or bright → a ramp tinted toward the world and an accent from it
- A headline that would fit another product if you swapped the name → say what this product does, with its own nouns
- A hero visual that is an empty box or a generic picture → a product preview in code or an image from the world
- Every product getting the same layout, type and palette → let the direction choose

---

## Part 2 — Deep pattern inventory

A practical catalog of recurring generic UI patterns. These are **review triggers, not automatic violations**. A pattern is problematic when unearned, repetitive, misleading, inaccessible, or disconnected from product context.

### Color and backgrounds

| # | Pattern | Why it can fail |
|---:|---|---|
| 1 | **Purple-to-blue gradient** | Default AI/SaaS palette used without product rationale. |
| 2 | **Purple-pink-cyan gradient** | Generic futuristic startup aesthetic. |
| 3 | **Gradient text headlines** | Randomly coloring words for emphasis. |
| 4 | **Gradient buttons** | Gradient replaces a meaningful brand color. |
| 5 | **Gradient on every section** | No visual restraint or hierarchy. |
| 6 | **Aurora backgrounds** | Large blurred colorful blobs behind content. |
| 7 | **Floating gradient orbs** | Decorative circles with no product meaning. |
| 8 | **Neon glow effects** | Glowing buttons, borders, cards and text everywhere. |
| 9 | **Cursor-following glow** | Mouse spotlight effect with no interaction value. |
| 10 | **Glassmorphism everywhere** | Frosted surfaces without meaningful layering. |
| 11 | **Excessive backdrop blur** | Blur substitutes for clear depth. |
| 12 | **Generic beige and orange palette** | Editorial palette applied without product reasoning. |
| 13 | **Random pastel surfaces** | Unrelated colored panels without semantic meaning. |
| 14 | **Noise/grain overlay everywhere** | Texture manufactures a premium or handmade look. |
| 15 | **Grid background everywhere** | Faint engineering grid used as generic decoration. |
| 16 | **Decorative radial gradients** | Background effects compete with content. |

### Typography

| # | Pattern | Why it can fail |
|---:|---|---|
| 17 | **Inter/Geist/Roboto everywhere** | Default typeface becomes the entire brand identity. |
| 18 | **Oversized hero typography** | Huge text ignores content, viewport or reading flow. |
| 19 | **Gradient-colored words** | Highlighted words become an automatic trick. |
| 20 | **Random italic serif word** | Serif word mixed into sans-serif copy without a concept. |
| 21 | **Excessive letter spacing** | Every label becomes uppercase and widely tracked. |
| 22 | **Monospace eyebrow labels** | Technical metadata styling without a technical reason. |
| 23 | **Excessive uppercase labels** | Every section receives a tiny all-caps category. |
| 24 | **Inconsistent font weights** | Weights chosen randomly rather than as hierarchy. |
| 25 | **Artificial line breaks** | Headlines broken awkwardly to imitate art direction. |
| 26 | **Too many font families** | Several typefaces compete without defined roles. |
| 27 | **Tiny low-contrast metadata** | Supporting information becomes difficult to read. |
| 28 | **Every heading is dramatic** | No distinction between primary and secondary information. |

### Hero sections

| # | Pattern | Why it can fail |
|---:|---|---|
| 29 | **Centered hero by default** | Every product starts with centered text. |
| 30 | **Eyebrow plus giant headline** | Same hierarchy repeated regardless of product. |
| 31 | **Orange dot plus uppercase label** | Decorative indicator used as an automatic eyebrow treatment. |
| 32 | **Sparkle / AI-powered badge** | AI badge added without explaining what AI does. |
| 33 | **Pill announcement badge** | Generic introducing capsule above the headline. |
| 34 | **Headline, subtitle, two CTAs** | Template structure repeated without considering user intent. |
| 35 | **Generic two-button hero** | Get started and Learn more regardless of context. |
| 36 | **Hero gradient blob** | Abstract decoration replaces product evidence. |
| 37 | **Fake dashboard mockup** | Invented UI with meaningless metrics or content. |
| 38 | **Floating UI cards** | Random cards imply complexity without evidence. |
| 39 | **Browser-frame screenshot** | Fake browser shell adds no useful context. |
| 40 | **Huge empty hero** | Whitespace has no compositional or informational purpose. |
| 41 | **Same hero on every page** | Page purpose and audience are ignored. |
| 42 | **Generic transformation headline** | Transform the way you says little about the product. |
| 43 | **Hero without product evidence** | No real screenshot, output, data or concrete example. |

### Layout and composition

| # | Pattern | Why it can fail |
|---:|---|---|
| 44 | **Three equal feature cards** | Three-column grid chosen automatically. |
| 45 | **Six-card feature grid** | Repeated icon-title-description modules. |
| 46 | **Bento grid everywhere** | Asymmetric boxes used because they are trendy, not useful. |
| 47 | **Uniform card layouts** | Every content type receives the same container. |
| 48 | **Card inside card** | Nested rounded rectangles create visual clutter. |
| 49 | **Everything inside a card** | Simple text is boxed without a grouping need. |
| 50 | **Repeated section layouts** | Every section follows the same composition. |
| 51 | **Excessive rounded rectangles** | Page becomes a pile of pills and cards. |
| 52 | **Same spacing everywhere** | No variation in density or hierarchy. |
| 53 | **Perfect symmetry by default** | No consideration of intentional asymmetry. |
| 54 | **Excessive centered content** | Left alignment and editorial flow are ignored. |
| 55 | **Arbitrary whitespace** | Empty space does not create hierarchy or focus. |
| 56 | **Repeated split sections** | Image-left/text-right alternation becomes mechanical. |
| 57 | **Generic testimonial grid** | Three identical quote cards. |
| 58 | **Fake logo wall** | Unverified logos manufacture credibility. |
| 59 | **Generic pricing cards** | Three tiers with identical hierarchy and copy. |
| 60 | **Every section full width** | No variation in reading measure or content width. |
| 61 | **Unnecessary dividers** | Rules separate elements already grouped. |

### Components

| # | Pattern | Why it can fail |
|---:|---|---|
| 62 | **Pill buttons everywhere** | Every action has maximum border radius. |
| 63 | **Identical radius on every component** | Buttons, cards, inputs and dialogs share one radius without hierarchy. |
| 64 | **Same shadow everywhere** | Every surface floats at the same elevation. |
| 65 | **Colored left-border accents** | Accent stripe is added to every card as decoration. |
| 66 | **Icon inside rounded square** | Default feature-card decoration. |
| 67 | **Emoji as product icon** | Emoji replace a coherent icon system. |
| 68 | **Generic icon overload** | Every feature receives a predictable line icon. |
| 69 | **Sparkle as AI identity** | Sparkle icon is used for every AI-related action. |
| 70 | **Too many badges** | New, popular, pro and featured labels lose meaning. |
| 71 | **Tooltip overload** | Basic information is hidden behind hover. |
| 72 | **Modal for everything** | Dialog used instead of inline or contextual interaction. |
| 73 | **Fake toggle switches** | Switches do not represent real binary settings. |
| 74 | **Unnecessary floating action button** | Floating action competes with primary navigation. |
| 75 | **Generic gradient avatars** | Initials in gradient circles are interchangeable. |
| 76 | **Decorative progress bars** | Progress indicator communicates no real progress. |
| 77 | **Decorative sparklines** | Tiny charts have no meaningful data or purpose. |

### Navigation

| # | Pattern | Why it can fail |
|---:|---|---|
| 78 | **Floating pill navbar** | Rounded capsule floats above every hero. |
| 79 | **Excessive navbar blur** | Glass effect without a layering need. |
| 80 | **Generic logo plus six links** | Template navigation ignores information architecture. |
| 81 | **Two competing navbar CTAs** | Primary action hierarchy is unclear. |
| 82 | **Every link is a pill** | Navigation and actions have no visual distinction. |
| 83 | **Sticky navigation by default** | Fixed header is used without user benefit. |
| 84 | **Oversized navigation** | Header competes with page content. |
| 85 | **Hamburger for every mobile layout** | Desktop navigation is collapsed without considering mobile tasks. |

### Animation and interaction

| # | Pattern | Why it can fail |
|---:|---|---|
| 86 | **Fade-up on every section** | Every element animates into view. |
| 87 | **Staggered card entrance** | Cards appear one-by-one without meaningful sequence. |
| 88 | **Scroll-triggered everything** | Scrolling triggers effects with no informational value. |
| 89 | **Cursor-following elements** | Decorative objects follow the pointer. |
| 90 | **Magnetic buttons everywhere** | Controls move toward cursor without clear benefit. |
| 91 | **Excessive hover scaling** | Every card grows on hover. |
| 92 | **Bounce animations** | Unnecessary playful motion. |
| 93 | **Infinite floating animation** | Decorative elements move forever. |
| 94 | **Parallax everywhere** | Layer movement adds complexity without comprehension. |
| 95 | **Animated gradient background** | Colors constantly change behind content. |
| 96 | **Fake page transitions** | Long animations delay navigation. |
| 97 | **Hover-only interaction** | Important functionality unavailable to touch and keyboard users. |
| 98 | **Motion without focus states** | Mouse interactions considered; keyboard interactions ignored. |
| 99 | **Unnecessary loading animation** | Fake progress or waiting is shown. |

### Copywriting and content

| # | Pattern | Why it can fail |
|---:|---|---|
| 100 | **Revolutionize your workflow** | Empty marketing language. |
| 101 | **Unlock your potential** | Generic benefit statement. |
| 102 | **Seamless experience** | Unsupported product claim. |
| 103 | **Powerful, flexible, scalable** | Generic three-word slogan. |
| 104 | **Not just X, but Y** | Repeated rhetorical construction. |
| 105 | **Built for the future** | No concrete meaning. |
| 106 | **One platform, endless possibilities** | Template marketing copy. |
| 107 | **Excessive em dashes** | Repetitive AI writing rhythm. |
| 108 | **Generic feature descriptions** | Copy does not explain what a feature does. |
| 109 | **Fake statistics** | Unverified percentages, user counts or uptime claims. |
| 110 | **Fake testimonials** | Invented users, quotes or company names. |
| 111 | **Placeholder company logos** | Credibility manufactured through visuals. |
| 112 | **Repeated generic CTAs** | Get started appears everywhere. |
| 113 | **AI-powered without explanation** | AI is mentioned without practical value. |
| 114 | **Repeated benefit statements** | Same message rewritten across sections. |

### Images and visual assets

| # | Pattern | Why it can fail |
|---:|---|---|
| 115 | **Generic stock photos** | Unrelated smiling office employees. |
| 116 | **AI-generated corporate people** | Artificial business photography without product reason. |
| 117 | **Fake dashboard screenshots** | Mockups contain meaningless data. |
| 118 | **Random 3D objects** | Floating cubes and spheres unrelated to product. |
| 119 | **Generic isometric illustrations** | Illustrations are decorative rather than explanatory. |
| 120 | **Emoji illustrations** | Emoji are used as primary visual assets. |
| 121 | **Random device mockups** | Laptop and phone frames add no context. |
| 122 | **Gradient avatar illustrations** | Generated profile images look interchangeable. |
| 123 | **Decorative abstract shapes** | Visuals have no relationship to product. |
| 124 | **Repeated stock photography** | Same image treatment appears throughout. |
| 125 | **Unrelated icon illustrations** | Visuals do not represent described feature. |

### Spacing and hierarchy

| # | Pattern | Why it can fail |
|---:|---|---|
| 126 | **Same spacing everywhere** | No intentional density decisions. |
| 127 | **Equal padding on every section** | Section importance is not reflected in rhythm. |
| 128 | **Excessive whitespace** | Page feels empty rather than composed. |
| 129 | **Cramped text blocks** | Reading rhythm is poor. |
| 130 | **Inconsistent alignment** | Components do not share a coherent grid. |
| 131 | **Identical content widths** | No variation in reading measure. |
| 132 | **Oversized section headings** | Every section competes for attention. |
| 133 | **No visual hierarchy** | Everything looks equally important. |
| 134 | **Arbitrary decorative separators** | Visual noise without information. |
| 135 | **Inconsistent vertical rhythm** | Related components have unrelated gaps. |

### Responsive and accessibility

| # | Pattern | Why it can fail |
|---:|---|---|
| 136 | **Desktop-only composition** | Mobile layout becomes an afterthought. |
| 137 | **Horizontal overflow** | Content exceeds the viewport. |
| 138 | **Tiny mobile typography** | Text becomes difficult to read. |
| 139 | **Small touch targets** | Controls are difficult to operate. |
| 140 | **Hover-only functionality** | Touch and keyboard users cannot access actions. |
| 141 | **Missing keyboard focus** | Keyboard users lose their place. |
| 142 | **Insufficient contrast** | Text and controls are difficult to perceive. |
| 143 | **Color-only status** | Information depends on color alone. |
| 144 | **Uncontrolled motion** | Animation may cause discomfort. |
| 145 | **Missing semantic structure** | Assistive technology cannot understand the interface. |
| 146 | **Broken responsive tables** | Important information becomes inaccessible. |

### Technical implementation

| # | Pattern | Why it can fail |
|---:|---|---|
| 147 | **Default component-library styling** | Unmodified kit appearance becomes product identity. |
| 148 | **Unmodified shadcn components** | Default radius, color and spacing are used everywhere. |
| 149 | **Tailwind defaults everywhere** | No deliberate tokens or product-specific system. |
| 150 | **Arbitrary CSS values** | Styles drift and become hard to maintain. |
| 151 | **Repeated CSS overrides** | Implementation becomes fragile. |
| 152 | **Inconsistent component variants** | Same component behaves differently across pages. |
| 153 | **Unnecessary dependencies** | Libraries are added for simple effects. |
| 154 | **Fake interactive controls** | Elements look functional but do nothing. |
| 155 | **Placeholder links** | Buttons and links lead nowhere. |
| 156 | **Hardcoded fake data** | Product appears populated with invented content. |
| 157 | **No empty states** | Missing data has no useful presentation. |
| 158 | **No error states** | Only the happy path is designed. |
| 159 | **No loading states** | Users cannot understand ongoing work. |
| 160 | **Unnecessary JavaScript animation** | Simple transitions require excessive code. |
| 161 | **No visual regression checks** | Changes break layouts unnoticed. |

### How to use this inventory

- Do not mechanically remove every listed pattern.
- Ask what user need, brand principle or information structure justifies it.
- Check repetition across the whole page, not only a single component.
- Prefer specific, evidence-based improvements over vague feedback such as 'make it more premium'.
- A familiar pattern can be right when it improves recognition, usability, consistency or accessibility.

---

## Credits

- **Part 1** — from _unslop_ by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0.
- **Part 2** — AI-Slop Pattern Inventory from the _unslop-design_ skill, CC BY 4.0.
