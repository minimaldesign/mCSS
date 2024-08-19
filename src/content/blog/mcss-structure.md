---
title: "The structure of mCSS"
pubDate: 2024-03-01
description: "An overview of mCSS file structure philosophy and how to build upon it."
author: "Yann"
tags: ["mCSS", "basics"]
---

## File organization

If you look at the imports in `_global.css` you'll see the basic organization. The order the files are imported is critical. It's based on ITCSS.

- Tokens: where all the global variables are set.
- Themes: easy way to override tokens globally.
- Elements: HTML elements.
- Global: layouts like `.wrap` and `.grid` and global styling like `.prose`.
- Components: component specific styling.
- Pages: page specific styling.
- Helpers: high specificity local overrides.
