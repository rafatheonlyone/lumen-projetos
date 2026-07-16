# Lumen Design System

**v2.1** — the foundational design language for every website Lumen builds. This is not a website — it's the shared vocabulary (tokens, layout patterns, primitives, a full section library, and a cohesive motion language) that every future Lumen project extends.

Four living pages to explore it:

- [`index.html`](./index.html) — foundations: color, typography, core components, forms
- [`sections.html`](./sections.html) — **the section library**: every section category in multiple handcrafted variants
- [`patterns.html`](./patterns.html) — the five layout patterns everything above is built on
- [`motion.html`](./motion.html) — **the Motion Language**: entrance choreography, magnetic buttons, premium hover, the circular theme switch

## Concept

**Lumen = light.** The system is built around a near-black canvas that lets a single warm "glow" accent (Lumen Gold) carry emphasis, contrasted by a cool violet for technological depth. This is the one idea every Lumen site should telegraph, even as layouts, imagery and copy change completely from project to project.

Type pairs a serif display face (**Fraunces**, variable optical size — gives headlines a handcrafted, editorial quality) against a highly legible sans (**Inter**) for everything functional, with **JetBrains Mono** reserved for small technical accents (eyebrows, labels, stats). This three-family pairing is what keeps Lumen sites from reading as "another SaaS template."

**v2.0's job is breadth without drift.** Every new variant added in this release reuses v1.0's tokens, easing curves, radii and spacing — nothing here introduces a second visual language. If a hundred Lumen sites are built from this library, each should be able to mix hero, CTA, and portfolio variants freely and still look like they came from the same studio.

## File structure

```
design-system/
├── tokens.css              # Every design decision as a CSS custom property (v1.0 + v2.0 additions)
├── reset.css                # Modern, opinionated element reset
├── base.css                  # Typography classes, layout primitives, focus states
├── utilities.css             # Glass, shadow, radius, spacing, aspect-ratio, grid-span helpers
├── motion.css                # Keyframes, scroll-reveal system, parallax/spotlight/drag hooks
├── patterns/
│   └── layout.css            # split, zigzag, bento, offset, sidebar, bleed — the 5 layout primitives
├── components/
│   ├── buttons.css
│   ├── badges.css            # badges, chips, tags
│   ├── forms.css
│   ├── accordion.css         # accordion/FAQ primitive, tabs
│   ├── overlay.css           # modal, toast, tooltip
│   ├── navigation.css        # breadcrumbs, pagination, footer (+ 3 footer variants)
│   ├── timeline.css          # vertical, centered-alternating, horizontal-scroll
│   ├── navbar.css            # default + solid/minimal/centered/bordered+megamenu variants
│   ├── hero.css               # centered (base) + split/minimal/media/portfolio variants
│   ├── cta.css                 # split/fullbleed/minimal (band variant lives in hero.css)
│   ├── cards.css               # feature/service/pricing/testimonial/team/blog/portfolio/stat
│   │                            # + generic modifiers: horizontal/glass/minimal/gradient-border
│   ├── services.css            # service-list (expandable rows), service-tile (bento)
│   ├── about.css                # split, stats-inline, values grid, timeline-based
│   ├── stats.css                # cards, inline, large-featured (band lives in sections.css)
│   ├── testimonials.css         # carousel, wall/masonry, featured-large
│   ├── pricing.css              # billing toggle, comparison table, single-plan
│   ├── faq.css                   # two-column, searchable, sidebar-categorized
│   ├── portfolio.css             # filterable, fullbleed case-study rows, horizontal slider
│   ├── team.css                  # dense grid, list rows, featured-leadership
│   ├── contact.css               # split+map, minimal, method cards
│   ├── blog.css                   # featured+list, row index, magazine bento
│   ├── features.css               # zigzag split, bento, checklist
│   ├── gallery.css                 # CSS-columns masonry, scroll-snap slider, lightbox
│   └── sections.css                # section headers, stats-band, gallery-grid, marquee
├── main.css                   # single entry point — imports everything in dependency order
├── main.js                     # vanilla JS: all v1.0 modules + carousel, filters, billing
│                                 #   toggle, FAQ search, lightbox, drag-scroll, parallax, spotlight,
│                                 #   magnetic buttons, circular theme transition, auto text-reveal
├── index.html                   # foundations style guide
├── sections.html                 # the full section-variant library
├── patterns.html                  # layout pattern reference
└── motion.html                     # the Motion Language reference
```

Import `main.css` and `main.js` on any new Lumen site and build pages by composing the classes documented here — no build step required, though the `@import` chain in `main.css` is safe to run through a bundler if a project wants one.

## How the library is organized (read this before adding a new site)

1. **Tokens** define every raw value.
2. **Layout patterns** (`patterns/layout.css`) define *structure* — grids and columns with no visual opinion. `.layout-split`, `.layout-zigzag`, `.layout-bento`, `.layout-offset`, `.layout-sidebar`.
3. **Components** define *appearance* on top of a layout pattern, or standalone where a pattern doesn't apply (buttons, badges, forms).
4. **Pages** compose components + patterns + real content.

Concretely: a new "About" section is *not* a new grid system. It's `.layout-split` (structure) plus `.about-split__*` classes (content styling) — see [`components/about.css`](./components/about.css). This is why the library can keep growing: new sections are additive content-styling on a small, fixed set of structural primitives, not new one-off CSS Grid declarations scattered across the codebase.

## Design decisions worth knowing

- **Dark-first.** Dark mode is the native canvas — it's where the glow concept reads best. Light mode (`[data-theme="light"]` on `<html>`) is a fully mirrored, equally intentional alternative, not an afterthought.
- **Fluid type, not breakpoint type.** Every font size in `tokens.css` uses `clamp()` so text scales continuously between a 360px and 1600px viewport instead of jumping at breakpoints.
- **8px spacing grid.** All spacing tokens (`--space-*`) are multiples of 4px/8px. Odd one-off values are never introduced in component CSS — extend `tokens.css` instead.
- **Motion has one job: communicate intent.** Every transition uses `--ease-out-expo` or the Lumen-signature `--ease-signature` curve (the same "weighted deceleration" family used by Linear/Vercel) rather than linear or ease-in-out defaults, which read as robotic. v2.0 adds `--ease-drag` specifically for carousels/sliders, which need a slightly snappier settle than page-level reveals.
- **Scroll reveals are attribute-driven.** `[data-reveal="up|down|left|right|scale|blur|rotate|clip|mask"]` + `main.js`'s `IntersectionObserver` toggles `[data-revealed]`. CSS owns *how* something animates in; JS only owns *when*.
- **Interactive variants are progressive enhancement.** Every JS-driven component (carousel, filter, billing toggle, FAQ search, lightbox) renders sensibly with JS disabled — content is visible, just not filtered/paginated/animated. main.js modules are self-contained and no-op if their markup isn't present, so including `main.js` site-wide is always safe.
- **Everything keyboard- and screen-reader-first.** Modals and the lightbox use native `<dialog>`, accordions use native `<details>/<summary>`, focus rings use `:focus-visible` (never suppressed), and every interactive component was built against the WAI-ARIA authoring patterns for its role.

## The Lumen Motion Language (v2.1)

Motion in this system exists to communicate — state changed, hierarchy shifted, attention is invited — never to perform. The test for every animation added here was: *does removing this make the interface feel worse, or just quieter?* If only quieter, it didn't ship.

**Principles**

1. **Weighted, not linear.** Nothing eases linearly except spinners (which are meant to feel mechanical) and marquees (constant speed *is* the point). Everything else decelerates — `--ease-luxury` and its siblings model a real object settling into place, not a robot stopping.
2. **Choreographed, not simultaneous.** When several elements enter together (a hero, a card grid, a megamenu), they enter in a staggered sequence via `--stagger-step`, not all at once. The eye should be able to follow an order.
3. **Above-the-fold content reveals on load, not on scroll.** Hero sections use pure-CSS `animation` (see `hero.css`'s entrance choreography) rather than the scroll-triggered `[data-reveal]` system, because content already in the viewport shouldn't need a scroll to appear.
4. **Interaction feedback is instant; state changes are not.** Magnetic buttons and the cursor-spotlight track the pointer with near-zero latency (`.is-magnet-active` drops the transition to 60ms) — anything slower would read as laggy. Releasing, opening, or navigating uses the slower, weighted curves instead.
5. **One signature moment, not many.** The circular theme-switch reveal exists because a light/dark swap is a rare, deliberate action worth marking. Most sites should have very few "moments" like this — reserve them for things a user does once per session, not every hover.
6. **CSS first, JS only when position/pointer math is unavoidable.** Every entrance, hover, and reveal timing lives in CSS. JavaScript is used only for the three things CSS genuinely cannot do alone: reading scroll/pointer position (parallax, magnetic, spotlight), observing intersection (scroll reveal, counters), and orchestrating the View Transitions API (theme switch).

**Easing &amp; duration reference**

| Token | Value | Use for |
|---|---|---|
| `--ease-luxury` | `cubic-bezier(0.22, 1, 0.36, 1)` | Flagship entrances: hero, navbar, modal, accordion |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Everyday hover/lift (v1.0 default, still correct) |
| `--ease-out-quint` | `cubic-bezier(0.23, 1, 0.32, 1)` | Slow cinematic moves: image zoom, large media |
| `--ease-in-out-smooth` | `cubic-bezier(0.65, 0, 0.35, 1)` | Symmetric state swaps: theme reveal, tab panels, shake |
| `--ease-magnetic` | `cubic-bezier(0.33, 1, 0.68, 1)` | Magnetic button release |
| `--ease-drag` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | Carousel/slider settle |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | The one curve allowed to overshoot — checkboxes, dots |
| `--duration-instant` → `--duration-slower` | 100ms – 900ms | Standard v1.0 scale — see `tokens.css` |
| `--duration-luxury` | 750ms | Hero/page-level entrance choreography |
| `--stagger-step` / `-tight` / `-loose` | 80ms / 45ms / 110ms | Delay between siblings in any staggered group |

**What's new in v2.1, concretely**

- **Hero + navbar entrance** — pure CSS `animation` choreography on `.hero__*` children and `.navbar` (see `hero.css`, `navbar.css`). Applies automatically to every hero variant; no markup change needed on existing pages.
- **Magnetic buttons** — `[data-magnetic="0.3"]` on any button/icon target; see `main.js`'s `Magnetic` module and `motion.css`. Strength is the attribute's value (fraction of pointer offset applied as translate).
- **Circular theme switch** — `Theme.toggleWithTransition()` in `main.js` wraps the existing toggle in `document.startViewTransition`, clipping a circle from the click point (`motion.css`, `:root[data-theme-transitioning]`). Falls back to the plain instant/cross-fade swap when unsupported or reduced-motion is on.
- **Auto text-reveal** — `[data-text-reveal]` on a heading auto-splits it into word spans and hands timing to the existing scroll-reveal `IntersectionObserver`; no manual span-wrapping required.
- **Premium card sheen + cinematic image zoom** — `.card--sheen` (diagonal light sweep) and `.img-zoom` (slow 1100ms quint-out zoom, distinct from snappier UI hover states).
- **rAF-batched parallax** — `Parallax` now collapses a burst of scroll events into one style write per frame via a ticking guard, removing the jank a naive scroll-bound parallax has under a fast trackpad fling.
- **Animated modal close** — `.modal` now transitions out via `@starting-style`/`allow-discrete` instead of just vanishing on `.close()`.
- **Choreographed accordion** — panel height, chevron rotation and content opacity now run on independent, offset timings (content fades in ~90ms after the row starts expanding; fades out instantly on collapse).
- **Refined shimmer** — skeleton loading states sweep at a diagonal (100deg) with a smoother, `--ease-in-out-smooth` timing rather than a flat left-right bar.

All of the above are gated by `prefers-reduced-motion` — either through the existing global overrides in `reset.css`/`tokens.css`, or (for JS modules that do real work, like `Magnetic`, `Parallax`, `Spotlight`, and the theme transition) an explicit early return. See [`motion.html`](./motion.html) for a live reference of everything in this section.

## Variant catalog (v2.0)

| Category | Variants | File |
|---|---|---|
| Navbar | default, solid, minimal, centered, bordered+megamenu | `navbar.css` |
| Hero | centered, split, minimal, media backdrop, portfolio backdrop | `hero.css` |
| CTA | band, split, fullbleed, minimal | `hero.css` + `cta.css` |
| Services | card grid, expandable list, bento tiles | `cards.css` + `services.css` |
| About | split, stats-inline, values grid, timeline-based | `about.css` |
| Statistics | band, cards, inline, large-featured | `sections.css` + `stats.css` |
| Testimonials | single card, carousel, wall/masonry, featured-large | `cards.css` + `testimonials.css` |
| Pricing | 3-tier cards, billing toggle, comparison table, single-plan | `cards.css` + `pricing.css` |
| FAQ | accordion, two-column, searchable, sidebar-categorized | `accordion.css` + `faq.css` |
| Portfolio | grid, filterable, fullbleed case-study rows, slider | `cards.css` + `portfolio.css` |
| Team | card grid, dense grid, list rows, featured-leadership | `cards.css` + `team.css` |
| Contact | split+map, minimal, method cards | `contact.css` |
| Footer | 4-column, minimal, newsletter, mega | `navigation.css` |
| Blog | card, featured+list, row index, magazine bento | `cards.css` + `blog.css` |
| Features | icon grid, zigzag split, bento, checklist | `cards.css` + `features.css` |
| Gallery | grid, CSS-columns masonry, scroll-snap slider, lightbox | `sections.css` + `gallery.css` |
| Timeline | vertical, centered-alternating, horizontal-scroll | `timeline.css` |
| Cards | + horizontal, glass, minimal, gradient-border modifiers | `cards.css` |

See [`sections.html`](./sections.html) for a live, working example of every row in this table.

## Usage guidelines for new projects

1. Never hardcode a raw color, size, radius, shadow or duration in page-level CSS — reference a token. If a value doesn't exist yet, add it to `tokens.css` first so every future project inherits it too.
2. Before writing new section CSS, check whether it's a new *layout* or just a new *composition* of an existing layout pattern — it's almost always the latter.
3. A new page-specific component should follow the existing naming convention: `.card--variant`, `.btn--variant`, BEM-ish `__element` / `--modifier` suffixes.
4. Keep the "one glow accent" rule: primary gold should remain the only color used for the strongest calls to action on a page. Violet is a supporting/secondary color, not a second primary.
5. Every new component needs a hover, focus, and (where relevant) disabled/loading state before it ships.
6. **Vary the mix, not the vocabulary.** A hundred Lumen sites should each pick a different combination of hero/CTA/testimonial/etc. variants — but never invent a one-off component outside this system without adding it here first.
7. Test in both themes and at `sm`/`md`/`lg`/`xl`/ultra-wide before considering a page done.

## Responsive scale

| Token (informal) | Width   |
|---|---|
| Mobile | 0–479px |
| sm | 480px |
| md (tablet) | 768px |
| lg (laptop) | 1024px |
| xl (desktop) | 1280px |
| 2xl | 1536px |
| Ultra-wide | 1920px+ |

`.container` caps at `--container-max` (1280px) by default; `.container--wide` (1440px), `.container--xl` (1600px, v2.0 — for bento/portfolio full-bleed sections) and `.container--narrow` (760px) cover the other common cases.

## Accessibility

- Semantic landmarks (`<nav>`, `<main>`, `<footer>`) and heading order are enforced in the showcase markup as the reference pattern.
- Color pairs in `tokens.css` were chosen to clear WCAG AA contrast for body text against their intended surfaces.
- `prefers-reduced-motion: reduce` is respected at both the token level (durations collapse to ~0) and the reset level (animations/transitions are forced to negligible duration) — components never need their own reduced-motion branch. v2.0's carousel/parallax/spotlight JS modules also check `prefers-reduced-motion` directly before animating.
- The comparison pricing table uses a semantic `<table>` with `<th scope="row">` for feature names, not a div grid — screen readers get real row/column relationships.
- The FAQ search filters visually via `[data-hidden]` but never removes focusable elements from the DOM in a way that traps focus; the lightbox and modals both trap focus via native `<dialog>` semantics.

## Changelog

**v2.1** — Motion Language release. See "The Lumen Motion Language" section above for the full philosophy and reference.
- New premium easing curves (`--ease-luxury`, `--ease-out-quint`, `--ease-in-out-smooth`, `--ease-magnetic`) and tokenized stagger steps, additive alongside v1.0's curves.
- Pure-CSS hero + navbar entrance choreography — applies automatically to every existing hero/navbar variant.
- Magnetic button interactions (`[data-magnetic]`), cursor-spotlight refinements, and rAF-batched parallax.
- Circular theme-switch transition via the View Transitions API, with full fallback.
- Auto word-splitting text reveal (`[data-text-reveal]`) reusing the existing scroll-reveal observer.
- Animated modal close (`@starting-style`/`allow-discrete`), choreographed accordion (independent height/icon/content timings), refined toast and megamenu curves.
- Premium card sheen (`.card--sheen`) and cinematic image zoom (`.img-zoom`) utilities; refined blog/portfolio image transitions to match.
- Refined skeleton shimmer (diagonal sweep, smoother easing) and a `.input-shake` validation utility.
- New `motion.html` showcase; nothing in v1.0/v2.0 changed in a way that alters existing page output — every addition is opt-in via a new class/attribute or a same-value token swap.

**v2.0**
- Added `patterns/layout.css`: 5 reusable structural primitives (split, zigzag, bento, offset, sidebar, bleed).
- Expanded every major section category to 3–5 variants (see catalog above).
- Relocated `.timeline` out of `accordion.css` into its own `timeline.css`, and added centered-alternating + horizontal-scroll variants.
- Added generic card modifiers (`--horizontal`, `--glass`, `--minimal`, `--gradient-border`) usable on any existing card type.
- Expanded `motion.css`: more reveal variants, parallax hook, cursor-spotlight, drag-scroll affordance, per-word text reveal.
- Expanded `utilities.css`: padding/gap utilities, aspect-ratio helpers, grid-span utilities, section background-alternation helpers.
- Expanded `main.js`: carousel, category filter, billing toggle, FAQ search, expandable service rows, lightbox, drag-scroll, parallax, spotlight.
- Added `sections.html` (full section library) and `patterns.html` (layout pattern reference).
- Token additions were strictly additive — no v1.0 token value changed.

**v1.0** — initial foundation: tokens, reset, base typography, motion system, core component library (buttons, navbar, hero, cards, forms, badges, accordion, overlay, navigation), `index.html` style guide.
