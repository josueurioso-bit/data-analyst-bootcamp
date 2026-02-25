# Implementation Plan — Design System (Lab Notebook)
**Source of truth:** `design-notes/DESIGN_SYSTEM.md`
**File to modify:** `app.html` (only)
**Status:** Ready to implement

---

## Goal

Apply the Lab Notebook design system to the full app. Replace the AI-generic purple gradient stack with the Compadre brand palette. No functionality changes — visual layer only.

---

## Pre-flight Checklist

- [ ] Read `design-notes/DESIGN_SYSTEM.md` in full before starting
- [ ] Open `app.html` in browser to see current state (baseline)
- [ ] Confirm live site is separate from local — changes are local-only until deploy

---

## Step 1 — Add Google Fonts to `<head>`

**Where:** After `<meta>` tags, before Tailwind CDN script.

**Add:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
```

**Verify:** Open browser DevTools → Network tab → confirm both Inter and Lora load.

---

## Step 2 — Add Tailwind Custom Config Block

**Where:** Immediately after the Tailwind CDN `<script>` tag, before the Babel `<script>` tag.

**Add:**
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

**Verify:** In browser console, run `tailwind.config.theme.extend.colors` — should return the token object.

---

## Step 3 — Page Background

**Where:** The root `<div>` wrapper — currently has inline `style` with the generic gradient.

**Change:**
```
style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}
```
**To:**
```
className="bg-parchment"
```
(remove the inline style entirely)

**Verify:** Page background is warm parchment, no gradient.

---

## Step 4 — Body Font

**Where:** The `<style>` block in `<head>` — the `body { font-family: ... }` declaration.

**Change** the font-family stack to:
```css
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
```

**Verify:** Body text renders in Inter (check DevTools → Computed → font-family).

---

## Step 5 — Heading Font

**Where:** Every instance of `style={{ fontFamily: 'Georgia, serif' }}` in JSX.

**Change all** to: `className="font-display"` (uses Lora via Tailwind config)

**Verify:** All `<h1>`, `<h2>` headings render in Lora.

---

## Step 6 — Header

**Where:** The `<header>` element (~line 962).

**Change:**
```
className="bg-white shadow-sm border-b border-gray-200"
```
**To:**
```
className="bg-cream border-b-2 border-moss"
```

**Verify:** Header has a visible moss bottom border, warm cream background, no shadow.

---

## Step 7 — Primary CTA Buttons (purple gradient → moss)

Search for all instances of:
```
bg-gradient-to-r from-purple-600 to-indigo-600
```
and:
```
hover:from-purple-700 hover:to-indigo-700
```

**Replace each with:**
```
bg-moss hover:bg-moss-dark
```
and remove the `hover:from-*` / `hover:to-*` classes.

Instances to hit:
- Send button (assessment chat footer)
- Next → button (tutorial)
- Sign In button (auth modal)
- Go to Sprint Dashboard button (results)
- Take Assessment Again button (results)
- Continue to Choose → button (LEARN phase)
- Generic sprint placeholder Continue button

**Verify:** All primary CTAs are flat moss green, no gradient.

---

## Step 8 — Success / Completion Buttons (emerald gradient → sage)

Search for all instances of:
```
from-emerald-500 to-teal-500
```

**Replace with:**
```
bg-sage hover:bg-[#4A7558]
```

Instances to hit:
- Start Sprint 1 → / Got it → button (tutorial final step)
- Go to Sprint Dashboard (results view)

**Verify:** Completion actions are sage green, not teal gradient.

---

## Step 9 — Phase Progress Bar

**Where:** The phase bar component (~line 1572).

Node sizes: `w-8 h-8` → `w-9 h-9`

Colors:
- Active: `bg-purple-600` → `bg-moss`
- Completed: `bg-emerald-500` → `bg-sage`
- Inactive: `bg-gray-200 text-gray-500` → `bg-stone text-bark`

Connector lines:
- Completed: `bg-emerald-400` → `bg-sage`
- Inactive: `bg-gray-200` → `bg-stone`

Phase labels:
- Active: `text-purple-700` → `text-moss`
- Completed: `text-emerald-600` → `text-sage`
- Inactive: `text-gray-400` → `text-bark`
- Add `tracking-widest` to all phase label spans

**Verify:** Phase bar reads clearly, active phase is moss, completed is sage.

---

## Step 10 — Card Dots (LEARN phase progress)

**Where:** The card dot indicators (~line 1621).

Sizes: `w-2.5 h-2.5` → `w-3 h-3`

Colors:
- Active: `bg-purple-600` → `bg-moss`
- Completed: `bg-emerald-500` → `bg-sage`
- Inactive: `bg-gray-300` → `bg-stone`

Card counter text: `text-xs text-gray-500` → `text-sm font-medium text-bark`

**Verify:** Dots are slightly larger and on-brand.

---

## Step 11 — Cards (backgrounds, borders, shadows)

Global search and replace:

| Find | Replace |
|------|---------|
| `bg-white rounded-2xl shadow-xl` | `bg-cream rounded-xl` |
| `bg-white rounded-2xl shadow-md` | `bg-cream rounded-xl` |
| `bg-white rounded-xl shadow-md` | `bg-cream rounded-xl` |
| `bg-white rounded-xl shadow-sm` | `bg-cream rounded-xl` |
| `bg-white rounded-xl p-` | `bg-cream rounded-xl border border-stone p-` |
| `border border-gray-200` | `border border-stone` |
| `border-2 border-gray-200` | `border-2 border-stone` |
| `shadow-lg hover:shadow-xl` | `` (remove both) |
| `hover:shadow-lg` | `` (remove) |

LEARN phase entry card top band:
- `bg-gradient-to-r from-purple-600 to-indigo-600` → `bg-moss`

**Verify:** No visible blur shadows on any card. Cards are cream on parchment.

---

## Step 12 — Phase Tags / Badges

| Tag | Find | Replace |
|-----|------|---------|
| Sprint badge | `bg-purple-100 text-purple-700` | `bg-moss text-cream` |
| LEARN tag | `bg-purple-100 text-purple-700` | `bg-moss bg-opacity-20 text-moss` |
| CHOOSE tag | `bg-indigo-100 text-indigo-700` | `bg-amber-flask bg-opacity-20 text-[#9A6110]` |
| BUILD tag | `bg-blue-100 text-blue-700` | `bg-sage bg-opacity-20 text-[#3A6648]` |
| "Problem" tag | `bg-orange-100 text-orange-700` | `bg-amber-flask bg-opacity-20 text-[#9A6110]` |
| "Concept" tag | `bg-blue-100 text-blue-700` | `bg-sage bg-opacity-20 text-[#3A6648]` |

**Verify:** Each phase tag reads clearly against cream background.

---

## Step 13 — Text Colors

Global replace:

| Find | Replace |
|------|---------|
| `text-gray-900` (headings) | `text-ink` |
| `text-gray-800` (body) | `text-ink` |
| `text-gray-700` (body) | `text-ink` |
| `text-gray-600` (secondary) | `text-bark` |
| `text-gray-500` (captions) | `text-bark` |
| `text-purple-600` (links/accents) | `text-amber-flask` |
| `text-purple-700` | `text-moss` |
| `text-purple-800` | `text-moss-dark` |
| `text-emerald-600` | `text-sage` |
| `text-indigo-600` | `text-moss` |

**Verify:** No gray-* text colors remain except in error states (red-*) and amber feedback.

---

## Step 14 — Auth Modal

**Where:** The modal dialog (~line 841).

- Container: `bg-white rounded-2xl shadow-2xl` → `bg-cream rounded-xl border-2 border-stone`
- Sign In button: purple gradient → `bg-moss hover:bg-moss-dark text-cream`
- Create Account button: `border-purple-300 text-purple-700 hover:border-purple-500 hover:bg-purple-50` → `border-stone text-ink hover:border-moss hover:bg-[#EAF0EC]`
- Google button focus ring: `focus:ring-purple-500` → `focus:ring-moss`
- Skip link: `text-gray-600` → `text-bark`

---

## Step 15 — Focus Rings

Global replace:
```
focus:ring-purple-500  →  focus:ring-moss
focus:ring-emerald-500 →  focus:ring-sage
```

**Verify:** Tab through the page — all focus indicators are moss-colored.

---

## Step 16 — Consent Banner

**Where:** ~line 1009.

- `bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200` → `bg-cream border-stone`
- Checkbox: `text-purple-600 focus:ring-purple-500` → `text-moss focus:ring-moss`
- Link: `text-purple-600 hover:text-purple-800` → `text-amber-flask hover:text-[#9A6110]`

---

## Step 17 — Dashboard Sprint Cards

**Where:** Sprint grid (~line 1491).

- Unlocked card: `border-purple-200 hover:border-purple-400` → `border-stone hover:border-moss`
- Unlocked "Click to start" text: `text-purple-600` → `text-moss`
- Locked card: `bg-gray-50 border-gray-200` → `bg-parchment border-stone`
- Sprint badge unlocked: `bg-purple-100 text-purple-700` → `bg-moss text-cream`

---

## Step 18 — Results View

**Where:** ~line 1115.

- Outer card: `bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200` → `bg-cream border-stone`
- Pillar cards: `bg-white rounded-xl shadow-md` → `bg-parchment rounded-xl border border-stone`
- Strengths block: `bg-emerald-50 border-emerald-200` → keep (semantic green, fine)
- Areas to develop: `bg-blue-50 border-blue-200` → `bg-parchment border-stone`
- Study plan gradient: `bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200` → `bg-cream border-stone`
- Sprint number stats: `text-indigo-600` → `text-moss`, `text-purple-600` → `text-amber-flask`
- Next Steps block: `bg-purple-50 border-purple-200` → `bg-[#EAF0EC] border-stone`

---

## Step 19 — Tutorial View

**Where:** ~line 1280.

- Step card: `bg-white rounded-2xl shadow-xl border-gray-200` → `bg-cream rounded-xl border border-stone`
- Current sprint highlight: `bg-purple-50 border-purple-200` → `bg-[#EAF0EC] border-moss`
- Current sprint badge: `bg-purple-600 text-white` → `bg-moss text-cream`
- "Starting here →" text: `text-purple-600` → `text-moss`
- Tutorial dots: active `bg-purple-600` → `bg-moss`
- Next → button: purple gradient → `bg-moss hover:bg-moss-dark text-cream`

---

## Verify After All Steps

1. Open `app.html` in browser (or local server)
2. Tab through every interactive element — all focus rings should be moss
3. Check every view: assessment, tutorial, results, dashboard, sprint (learn + choose), auth modal
4. Confirm zero blur shadows visible anywhere
5. Confirm mascot image reads cleanly on cream/parchment backgrounds (use `mix-blend-multiply`)
6. Run browser DevTools accessibility checker — contrast should be at or above baseline

---

## Files Modified

- `app.html` — visual layer only
- No API files, no logic, no database schema

## Files NOT Modified

- `api/` — untouched
- `data/` — untouched
- `docs/` — untouched
- Accessibility attributes (`aria-*`, `role`, `sr-only`, focus rings structure) — untouched
