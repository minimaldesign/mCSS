---
layout: ../../layouts/MarkdownPostLayout.astro
title: "The structure of mCSS"
pubDate: 2024-03-01
description: "An overview of mCSS file structure philosophy and how to build upon it."
author: "Yann"
tags: ["mCSS", "basics"]
---

## File organization

If you look at the imports in `_global.css` you'll see the basic organization. The order the files are imported is critical. It's based on
