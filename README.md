# Basic Calculator Web App

A keyboard-first calculator with scientific extras, calculation history, memory keys and a system-aware dark / light theme — no `eval`, no dependencies beyond React.

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

Arithmetic runs without `eval`: input is tracked as separate `currentInput`, `previousInput` and `operator` values, so chained operations and repeated equals behave predictably. The pure calculation core (`src/lib/calc.ts`) rounds at 12 significant digits, so IEEE-754 dust like `0.1 + 0.2 = 0.30000000000000004` never reaches the display — you get `0.3`.

## Tech stack

React 19 · TypeScript · Vite · Vitest

## Features

- Chained calculation — the running result feeds the next operation
- Scientific keys (toggle `S`) — √, x², 1/x and π, applied directly to the operand state machine
- Memory keys — MC / MR / M+ / M− with a persisted register and an on-grid `M` indicator
- Calculation history — a click-to-reuse panel (toggle `H`) that persists across reloads; tap any entry to bring its result back
- Copy result button, plus clipboard paste of numbers straight into the display
- Correct decimals — `0.1 + 0.2 = 0.3`, `1 ÷ 3 × 3 = 0.999999999999` (12-digit precision, like a physical calculator)
- Full keyboard support — digits, operators, `Enter`, `Backspace`/`Delete`, `Escape`, `R` (reset), `H`, `S`
- Theme cycle — System → Dark → Light, persisted, with a pre-paint inline script so the first frame is never the wrong theme
- Accessibility — `aria-live` results, labelled controls, visible focus rings, WCAG AA contrast in both themes, and full `prefers-reduced-motion` fallbacks

### Revamp (2026-10)

The calculator is treated as a physical object — same state machine, deeper feel:

- **Key press choreography** — keys press in fast (90 ms) and spring back with a slight overshoot; a typed key visually depresses the matching on-screen button
- **Display transitions** — every digit entry and result lands with a short settle animation; a divide-by-zero shakes the display before the 2-second auto-reset
- **Theme toggle micro-interaction** — the toggle dot rotates and scales as the palette crossfades
- **Mobile-perfect** — `dvh`-based layout, safe-area insets, a 64 px thumb grid and ≥44 px touch targets

All motion is CSS-only (`transform`/`opacity`, ≤400 ms).

## Run locally

```bash
git clone https://github.com/Mister2314/Basic-Calculator-Web-App.git
cd Basic-Calculator-Web-App
npm install
npm run dev       # dev server
npm test          # 13 unit tests on the calculation core
npm run build     # typecheck + production build
```

## What I learned

Writing the arithmetic by hand instead of calling `eval` was what made decimals and repeated-equals behaviour explicit rather than accidental.
