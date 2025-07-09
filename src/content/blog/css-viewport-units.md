---
title: "CSS Viewport Units Cheat Sheet (and Why 100vh Is Broken)"
pubDate: 2025-07-08
author: "Yann"
tags: ["css", "responsive design", "viewport units", "web dev", "front-end"]
description: "CSS viewport units are essential for building responsive layouts, but with mobile browsers’ dynamic UI, using them efficiently can get tricky."
---

## The Problem with Old Viewport Units

The `vh` unit (and similarly `vw`) was originally defined as 1% of the initial containing block ([ICB](https://developer.mozilla.org/en-US/docs/Web/CSS/Initial_containing_block)), which matches the viewport size. This worked well until mobile browsers began dynamically adjusting their UI, like toolbars, to maximize screen space. This dynamic resizing led to jarring content shifts. Using `vh` for properties like `font-size` would exacerbate this issue.

In 2015, Safari/Webkit made `vh` static, tying it to the _largest_ viewport size (when the browser UI is minimized). Chrome/Blink followed in 2016. This stopped dynamic resizing but introduced a new issue: `height: 100vh` overflowed the screen on initial load when the browser UI was expanded, making it hard to fit content perfectly with CSS alone.

To fix these issues, new viewport units were introduced in 2021.

## The Solution: Smarter Viewport Units for Real Devices

**`svh`, `svw`**: 1% of the viewport when browser UI is fully visible (smallest viewport). Use for content that must always fit on initial load (e.g., splash screens, onboarding modals).

**`lvh`, `lvw`**: 1% of the viewport when browser UI is fully hidden (largest viewport). Use for immersive sections that should fill the screen after scrolling (e.g., parallax backgrounds, full-screen galleries).

**`dvh`, `dvw`**: 1% of the current dynamic viewport. Use for containers that must always fit the visible area, even as toolbars appear/disappear (e.g., main content area that stretches to the bottom, allowing a sticky footer to stay at the bottom; always-visible chat widgets).

**`vmin`, `vmax`**: The smaller/larger of `vw` or `vh` (and their `sv`, `lv`, `dv` variants).

## When to Use Each Viewport Unit

Use `svh` for content that shouldn't be hidden on load (e.g., hero, onboarding, splash, or login screens).

Use `lvh` for immersive, full-screen effects after scroll (e.g., galleries, parallax sections).

Use `dvh` for containers that must always fit the visible viewport (e.g., set `min-height: 100dvh` on the main content area so a sticky footer stays at the bottom, or for chat widgets and modals that follow the viewport as toolbars appear or disappear).

Use `vmin` for always-visible elements that must fit entirely within the viewport, regardless of orientation (think: `background-size: contain`). Examples: modals. It can also be used for responsive typography.

Use `vmax` for elements that must always cover the entire viewport, even if it means overflowing in one direction (think: `background-size: cover`).

## Viewport Units at a Glance

| Unit   | What It Means                        | When to Use                        |
| ------ | ------------------------------------ | ---------------------------------- |
| `vh`   | 1% of largest viewport (legacy)      | General use, but beware on mobile  |
| `svh`  | 1% of smallest viewport (UI visible) | Hero, onboarding, login screens    |
| `lvh`  | 1% of largest viewport (UI hidden)   | Full-screen, immersive sections    |
| `dvh`  | 1% of current dynamic viewport       | Main containers for sticky footers |
| `vmin` | Smaller of `vw`/`vh`                 | Modals, responsive typography      |
| `vmax` | Larger of `vw`/`vh`                  | Responsive typography,             |

**Pro tip:** _Always_ [test on real devices](/blog/local-dev-tunnel) or else you'll miss something. Viewport behavior can still vary between browsers!
