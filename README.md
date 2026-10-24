# Basic Calculator Web App

An iOS-style calculator that chains operations, supports the keyboard, and ships with a dark / light theme switch.

**Live demo:** https://mister2314.github.io/Basic-Calculator-Web-App/

<div align="center">

| Desktop | Mobile |
|---|---|
| <img src="docs/shot-desktop.png" alt="Desktop view" width="700"> | <img src="docs/shot-mobile.png" alt="Mobile view" width="290"> |

</div>

## What it does

Arithmetic runs without `eval`: input is tracked as separate `currentInput`, `previousInput` and `operator` values, so chained operations, repeated equals and decimals behave predictably. The 267-line `script.js` also handles thousand-separator formatting and switches to exponential notation past 10 digits.

## Tech stack

HTML · CSS · Vanilla JS

## Features

- Chained calculation — the running result feeds the next operation
- Repeated equals repeats the last operation, like a physical calculator
- Full keyboard support (digits, operators, Enter, Backspace, Escape) via a `keydown` handler
- Display font scales down automatically as the number grows
- Dark / light theme built on CSS custom properties

## Run locally

```bash
git clone https://github.com/Mister2314/Basic-Calculator-Web-App.git
cd Basic-Calculator-Web-App
npx serve .
# or just open index.html
```

## What I learned

Writing the arithmetic by hand instead of calling `eval` was what made decimals and repeated-equals behaviour explicit rather than accidental.
