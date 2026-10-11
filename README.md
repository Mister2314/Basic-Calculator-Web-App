# Calculator

**An iOS-inspired calculator with chained operations, keyboard support and a built-in light / dark theme switch.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-mister2314.github.io/Basic--Calculator--Web--App-2ea44f?style=flat-square&logo=vercel&logoColor=white)](https://mister2314.github.io/Basic-Calculator-Web-App/)
![HTML5](https://img.shields.io/badge/HTML5-e34f26?style=flat-square&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572b6?style=flat-square&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-f7df1e?style=flat-square&logoColor=white)

<p align="center">
  <a href="https://mister2314.github.io/Basic-Calculator-Web-App/">
    <img src="docs/preview.png" alt="Calculator — desktop preview" width="100%">
  </a>
</p>

## Overview

A calculator that behaves the way a calculator should: it keeps a running result, so you can chain `2 + 3 × 4` without pressing equals in between, and it shows you both the expression and the current value.

The arithmetic is deliberately not `eval`. Input is tracked as separate `currentInput`, `previousInput` and `operator` values, which makes decimal handling, sign flipping and repeated-equals behaviour explicit rather than accidental.

The whole thing is themed with CSS custom properties and ships with a dark and a light palette, switchable from the header.

## Features

- Four operations with chained calculation — the running result feeds the next step
- Repeats the last operation when equals is pressed again
- Decimal handling, sign toggle (±) and percentage
- Live expression line above the current value
- Thousand-separator number formatting
- Full keyboard support
- Dark / light theme toggle
- No dependencies — plain HTML, CSS and JavaScript

## Tech Stack

| Layer | Technology |
| --- | --- |
| Markup | HTML5 |
| Styling | CSS3, custom-property themes |
| Logic | Vanilla JavaScript |
| Deploy | GitHub Pages |

## Screenshots

| Desktop | Mobile |
| :---: | :---: |
| <img src="docs/preview.png" alt="Desktop view"> | <img src="docs/preview-mobile.png" alt="Mobile view" width="230"> |

## Getting Started

No build step and no dependencies — clone the repo and open the entry file, or serve the folder locally:

```bash
git clone https://github.com/Mister2314/Basic-Calculator-Web-App.git
cd Basic-Calculator-Web-App

# Option 1 — open it directly
start index.html      # Windows
open  index.html      # macOS

# Option 2 — serve it locally
npx serve .
```

## Project Structure

```
index.html — keypad, display and theme switch
script.js — input state machine, arithmetic, formatting, theme toggle
styles.css — keypad grid and both colour palettes
```

## Notes

Writing the arithmetic by hand was more work than `eval` would have been, and worth it — it is the difference between a calculator that handles `0.1 + 0.2` predictably and one that does not.

## Author

**Xəyal Hüseynli** — Junior Front-End Developer

[Portfolio](https://hypnosdev.vercel.app) · [GitHub](https://github.com/Mister2314) · [LinkedIn](https://www.linkedin.com/in/x%C9%99yal-h%C3%BCseynli-3487b91ba/) · [xeyalhuseynli06@gmail.com](mailto:xeyalhuseynli06@gmail.com)
