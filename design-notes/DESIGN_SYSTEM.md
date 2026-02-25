# Compadre — Design System
**Version:** 1.0
**Status:** Canonical. Read before modifying any UI in `app.html`.
**Last updated:** February 24, 2026

---

## Brand Identity

**Persona:** The Mad Scientist Mentor. Compadre is the eccentric biology professor who actually wants you to succeed — calm authority, warm encouragement, occasional flashes of brilliance. Think worn leather notebook, handwritten labels on specimen jars, a lab coat that's seen better days. Knowledgeable without being intimidating.

**Mascot:** Pixel art axolotl with round professor glasses. The gill fronds spiked up like wild hair are the mad scientist detail — keep that energy in the UI. Both versions (pixel + illustrated) stay black-and-white line art. They read clean on parchment.

**Voice x Design contract:** Compadre's copy is already warm and direct. The design must match that — no cold gradients, no corporate blues, no generic shadows. Everything should feel like it was made by hand, intentionally.

---

## Color Palette — "Lab Notebook"

Colors are named semantically. Use the name, not the hex, when deciding which to apply.

### Core Tokens

| Token Name        | Hex       | Tailwind Custom Name  | Usage |
|-------------------|-----------|-----------------------|-------|
| `moss`            | `#3D5A47` | `moss`                | Primary brand — headers, active phase, primary CTA background |
| `amber`           | `#C17F24` | `amber-flask`         | Accent — hover states, highlights, "recommended" tags, links |
| `sage`            | `#5C8C6A` | `sage`                | Success states, completed phases, correct answer feedback |
| `parchment`       | `#F7F3EC` | `parchment`           | Page background — replaces the generic gradient |
| `ink`             | `#1C2017` | `ink`                 | Primary text — all body copy, headings |
| `stone`           | `#D4CEBD` | `stone`               | Borders, dividers, inactive elements |
| `bark`            | `#7A6E5F` | `bark`                | Secondary text — subtitles, labels, captions |
| `cream`           | `#FDFAF4` | `cream`               | Card backgrounds — slightly warmer than parchment |

### Semantic Aliases (what to use where)

| Situation | Token |
|-----------|-------|
| Page background | `parchment` |
| Card / panel background | `cream` |
| Primary button | `moss` |
| Primary button hover | `moss` darkened ~10% (`#2E4436`) |
| Accent / highlight | `amber-flask` |
| Success / correct | `sage` |
| Error / warning | Keep Tailwind `red-700` — semantic, not brand |
| "Try again" / partial | Keep Tailwind `amber-600` — warm, matches palette |
| Primary text | `ink` |
| Secondary text | `bark` |
| Borders | `stone` |
| Active phase indicator | `moss` |
| Completed phase indicator | `sage` |
| Inactive / locked | `stone` text on `parchment` bg |

### What's Retired

These Tailwind defaults are no longer used as primary brand colors:
- `purple-600` / `indigo-600` — retired from CTAs, phase tags, progress indicators
- `bg-gradient-to-r from-purple-600 to-indigo-600` — retired entirely
- `from-emerald-500 to-teal-500` — retired as success gradient
- `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)` — retired as page background

**One gradient rule:** Gradients are only permitted for the primary CTA button, and only as a subtle `from-moss to-[#2E4436]` (moss darkening). No multi-hue gradients anywhere.

---

## Typography

### Font Stack

```
Headings:  'Lora', Georgia, serif
Body:      'Inter', system-ui, -apple-system, sans-serif
Mono:      'JetBrains Mono', 'Fira Code', monospace (for code snippets only)
```

**Load via Google Fonts CDN** (add to `<head>` in `app.html`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
```

**Why Lora:** Serif with warmth — closer to a field notebook than Georgia's academic coldness. The italic weight is useful for Compadre's voice moments ("Most learners find this part tricky.").

**Why Inter:** The most legible humanist sans-serif at small sizes. Designed for screens. Excellent WCAG performance. Replaces the fallback `system-ui` stack.

### Type Scale

| Element | Size | Weight | Font | Color |
|---------|------|--------|------|-------|
| Page H1 (header) | `text-2xl` | `font-bold` | Lora | `ink` |
| Card H2 | `text-xl` | `font-bold` | Lora | `ink` |
| Section H3 | `text-base` | `font-semibold` | Inter | `ink` |
| Body copy | `text-base` | `font-normal` | Inter | `ink` |
| Secondary / caption | `text-sm` | `font-normal` | Inter | `bark` |
| Phase tags / badges | `text-xs` | `font-bold` | Inter | varies |
| Card counter | `text-xs` | `font-normal` | Inter | `bark` |

**Minimum body text color:** `bark` (`#7A6E5F`) on `cream` — contrast ratio 4.8:1, passes WCAG AA.
**Never use:** `text-gray-400` or lighter for any readable text.

---

## Component Rules

### Buttons

**Primary CTA (one per screen):**
```
bg-moss text-cream font-semibold rounded-xl px-6 py-3
hover:bg-[#2E4436] transition-colors
focus:ring-2 focus:ring-moss focus:ring-offset-2
```
No gradient. Flat moss. Hover darkens. That's it.

**Secondary / ghost button:**
```
border-2 border-stone text-ink font-medium rounded-xl px-6 py-3
hover:border-amber-flask hover:text-amber-flask transition-colors
```

**Choice buttons (LEARN / CHOOSE options):**
```
border-2 border-stone bg-cream text-ink rounded-xl px-5 py-4 text-left
hover:border-moss hover:bg-[#F0EDE4] transition-all
focus:ring-2 focus:ring-moss focus:ring-offset-2
```
When selected: `border-moss bg-[#EAF0EC]` (moss-tinted cream).

**Destructive / skip:**
Plain text link style. `text-bark underline hover:text-ink`. Never a button shape for deemphasized actions.

### Cards

**Shadow rule — pixel art constraint:**
No blur shadows anywhere. The pixel art mascot reads wrong next to soft drop shadows — they belong to different visual languages. Depth comes from the two-tone background system (`parchment` page + `cream` cards) and border weight, not blur.

Banned: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`
Allowed: `border border-stone` or `border-2 border-moss` for emphasis

**Standard card:**
```
bg-cream rounded-xl border border-stone
```
`rounded-xl` not `rounded-2xl` — slightly crisper to match the pixel mascot's hard edges.

**Phase card (LEARN / CHOOSE / BUILD / PUBLISH header area):**
- Left border accent: `border-l-4 border-moss` on the card, not a colored header band
- Exception: Card 1 of LEARN phase (entry card) keeps a full colored top band — but in `moss`, not purple gradient

**Feedback card (correct answer):**
```
bg-[#EAF0EC] border-2 border-sage rounded-xl
```

**Feedback card (try again):**
```
bg-amber-50 border-2 border-amber-300 rounded-xl
```
(Keep Tailwind amber here — it's semantic and matches the warm palette.)

**Locked sprint card:**
```
bg-parchment border border-stone rounded-xl opacity-70
```

### Progress Indicators

**Phase bar (LEARN → CHOOSE → BUILD → PUBLISH):**
- Active node: `w-9 h-9 bg-moss text-cream` — slightly larger than current `w-8 h-8`
- Completed node: `w-9 h-9 bg-sage text-cream`
- Inactive node: `w-9 h-9 bg-stone text-bark`
- Connector line: `h-0.5` — `bg-sage` if completed, `bg-stone` if not
- Phase label: `text-xs font-bold uppercase tracking-widest` — more visual weight than current

**Card dots (Card X of 5):**
- Active: `w-3 h-3 bg-moss rounded-full`
- Completed: `w-3 h-3 bg-sage rounded-full`
- Upcoming: `w-3 h-3 bg-stone rounded-full`
- Size bumped from `w-2.5` to `w-3` — small but intentional

**The card counter text ("Card 3 of 5"):**
- Keep it. Make it `text-sm font-medium text-bark` — slightly more visible than current `text-xs text-gray-500`.

### Phase Tags / Badges

Each phase gets a flat color tag. No gradients.

| Phase | Background | Text |
|-------|-----------|------|
| LEARN | `bg-moss bg-opacity-15 text-moss` | Deep moss on moss-tinted bg |
| CHOOSE | `bg-amber-flask bg-opacity-15 text-[#9A6110]` | Darker amber for contrast |
| BUILD | `bg-sage bg-opacity-15 text-[#3A6648]` | Darker sage for contrast |
| PUBLISH | `bg-[#5A4A3A] bg-opacity-15 text-[#5A4A3A]` | Warm brown — "done" |

**Sprint number badge:**
```
bg-moss text-cream text-xs font-bold px-2 py-1 rounded-full
```

### Header

```
bg-cream border-b-2 border-moss shadow-none
```
The `border-b-2 border-moss` replaces the generic `shadow-sm border-gray-200`. Gives the header a brand anchor without weight.

Logo: `mix-blend-multiply` stays — works well on `cream`.

### Page Background

```css
background-color: #F7F3EC; /* parchment */
```
Flat. No gradient. The card system and border colors provide all the depth needed.

### Auth Modal

```
bg-cream rounded-xl border-2 border-stone
```
No shadow — consistent with the no-blur-shadow rule.
Primary action button: `bg-moss` (not purple gradient).
Secondary link button: `border-2 border-stone hover:border-moss`.

---

## ADHD Design Rules — Design Token Mapping

This maps the 7 non-negotiable rules to specific design decisions.

| Rule | Design Token Decision |
|------|----------------------|
| Rule 4: Progress always visible | Phase nodes `w-9 h-9`, card dots `w-3 h-3`, counter `text-sm font-medium` |
| Rule 7: Time anchors | Time estimates use `text-bark italic` — softer than headings, always present |
| Rule 3: No blocking failure | "Try again" feedback: `amber-50 / amber-300` — warm, not red, not punishing |
| Rule 1: Problem before instruction | Entry card top band: `bg-moss` — visually distinct from concept cards |
| Rule 5: Constrained choice | Recommended badge: `bg-amber-flask` accent — stands out without a loud label |

---

## What Does NOT Change

- All `aria-*` attributes, `role` attributes, skip links, focus rings — untouched
- All `sr-only` patterns — untouched
- `@media (prefers-reduced-motion)` block — untouched
- Semantic HTML structure — untouched
- Georgia is replaced by Lora, but heading hierarchy (h1 → h2 → h3 order) stays
- `focus:ring-2` on all interactive elements — updated to `focus:ring-moss` but kept everywhere

---

## Tailwind Config Extension

Since Compadre uses Tailwind via CDN (no build step), custom colors go in an inline config block in `app.html`:

```html
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          'moss':        '#3D5A47',
          'moss-dark':   '#2E4436',
          'amber-flask': '#C17F24',
          'sage':        '#5C8C6A',
          'parchment':   '#F7F3EC',
          'cream':       '#FDFAF4',
          'ink':         '#1C2017',
          'stone':       '#D4CEBD',
          'bark':        '#7A6E5F',
        },
        fontFamily: {
          'display': ['Lora', 'Georgia', 'serif'],
          'body':    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        }
      }
    }
  }
</script>
```

Place this block **after** the Tailwind CDN `<script>` tag and **before** the Babel `<script>` tag.

---

## Visual Hierarchy Priority (read before every UI decision)

1. **What does the user need to do right now?** — That element gets `moss` or `amber-flask`.
2. **Where are they in the flow?** — Progress bar + card counter. Always visible. Never sacrificed for "clean."
3. **What did they just accomplish?** — `sage` confirmation. Brief. Not effusive.
4. **What's everything else?** — `ink` on `cream`. Let the content breathe.

---

## Contrast Reference (parchment/cream backgrounds)

| Text color | Hex | On parchment | On cream | WCAG |
|-----------|-----|-------------|---------|------|
| `ink` | `#1C2017` | 16.2:1 | 16.8:1 | AAA |
| `bark` | `#7A6E5F` | 4.8:1 | 4.9:1 | AA |
| `moss` | `#3D5A47` | 7.1:1 | 7.3:1 | AAA |
| `amber-flask` | `#C17F24` | 3.1:1 | 3.2:1 | AA (large text only) |
| `sage` | `#5C8C6A` | 4.5:1 | 4.6:1 | AA |

**amber-flask rule:** Never use `amber-flask` for body text. Use it only for large text (18px+), icons, borders, or backgrounds with `ink` text on top.

---

## Implementation Order (Day 3 Task 3.1 scope)

When implementing, touch in this order to catch regressions early:

1. Add Google Fonts `<link>` tags to `<head>`
2. Add Tailwind config block with custom colors and fonts
3. Update page background (single line)
4. Update header (border color, background)
5. Update primary CTA buttons (moss, no gradient)
6. Update phase progress bar (node sizes, colors)
7. Update card backgrounds and borders (cream, stone)
8. Update phase tags/badges
9. Update card dot indicators
10. Update text colors (ink, bark, sage replacements)
11. Update auth modal
12. Full E2E visual check in browser
