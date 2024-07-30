---
title: "The structure of mCSS"
pubDate: 2024-03-01
description: "An overview of mCSS file structure philosophy and how to build upon it."
author: "Yann"
tags: ["mCSS", "basics"]
---

## File organization

If you look at the imports in `_global.css` you'll see the basic organization. The order the files are imported is critical. It's based on ITCSS

- Tokens: where all the global variables are set
- Themes: customizations
- Elements: HTML elements
- Layouts: global layouts like wrappers and grids. Classes start with `l_`.
- Components: component specific styling. Classes start with `c_`.
- Pages: page specific styling. Classes start with `p_`.
- Helpers: high specificity local overrides
