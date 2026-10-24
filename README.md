# Basic Calculator Web App

An iOS-style calculator that chains operations, supports the keyboard, and ships with a dark / light theme switch.

**Live demo:** https://basic-calculator-web-app.vercel.app

<div align="center">

<img src="docs/demo.gif" alt="Basic Calculator Web App — animated demo" width="700">

| Desktop | Mobile |
|---|---|
| <img src="docs/shot-desktop.png" alt="Desktop view" width="700"> | <img src="docs/shot-mobile.png" alt="Mobile view" width="290"> |

<details>
<summary>More screenshots</summary>

| Desktop | Mobile |
|---|---|
| <img src="docs/preview.png" alt="Desktop, alternate view" width="700"> | <img src="docs/preview-mobile.png" alt="Mobile, alternate view" width="290"> |

</details>

</div>

## What it does

Arithmetic runs without `eval`: input is tracked as separate `currentInput`, `previousInput` and `operator` values, so chained operations, repeated equals and decimals behave predictably. The 267-line `script.js` also handles thousand-separator formatting and switches to exponential notation past 10 digits.

## Tech stack

React 19 · TypeScript · Vite

## Features

- Chained calculation — the running result feeds the next operation
- Repeated equals repeats the last operation, like a physical calculator
- Full keyboard support (digits, operators, Enter, Backspace, Escape) via a `keydown` handler
- Display font scales down automatically as the number grows
- Dark / light theme built on CSS custom properties

### Revamp (2026-10)

The calculator is treated as a physical object — same state machine, deeper feel:

- **Key press choreography** — keys press in fast (90 ms) and spring back with a slight overshoot; a typed key visually depresses the matching on-screen button
- **Display transitions** — every digit entry and result lands with a short settle animation; a divide-by-zero shakes the display before the 2-second auto-reset
- **History strip** — the last three operations appear as a quiet ledger above the calculation line (display only; it never touches the calculation logic)
- **Theme toggle micro-interaction** — the toggle dot rotates and scales as the palette crossfades
- **Mobile-perfect** — `dvh`-based layout, safe-area insets, and a 64 px thumb grid
- **Accessibility** — `aria-live` announcements on the display, labelled buttons, visible focus rings, and full `prefers-reduced-motion` fallbacks

All motion is CSS-only (`transform`/`opacity`, ≤400 ms) — zero new JavaScript dependencies.

## Run locally

```bash
git clone https://github.com/Mister2314/Basic-Calculator-Web-App.git
cd Basic-Calculator-Web-App
npx serve .
# or just open index.html
```

## What I learned

Writing the arithmetic by hand instead of calling `eval` was what made decimals and repeated-equals behaviour explicit rather than accidental.
