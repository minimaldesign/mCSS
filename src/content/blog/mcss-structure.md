---
title: "mCSS structure and organization"
pubDate: 2024-07-23
author: "Yann"
tags: ["mCSS", "basics"]
description: "An overview of mCSS file structure philosophy and how to build upon it."
---

## File structure

If you look at the imports in `_global.css` you'll see the basic organization. The order the files are imported is critical. It's based on ITCSS.

- Tokens: where all the global variables are set.
- Themes: easy way to override tokens globally.
- Elements: HTML elements.
- Global: layouts like `.wrap` and `.grid` and global styling like `.prose`.
- Components: component specific styling.
- Pages: page specific styling.
- Helpers: high specificity local overrides.

## CSS organization

The idea is to be able to scan a selector's property at a glance and be able to roughly know what it does and where to find what you need. It doesn't need to be super strict, but you should think about it as "outside → in" or "general → specific." So you first write what affect your element on the page, like positioning, then what affects the element itself, like size, passing, etc. Then what affects what's inside your element, like text.

Some of it is a little arbitrary, like putting `margin` after `width` and `height`. But as long as the related properties are grouped together mostly logically, then it's more of personal preference really.

And please, don't order them alphabetically… Unless you're a robot, it won't help.

```css
.selector {
  /* Positioning */
  position: absolute;
  top: 0;
  right: 0;

  /* Display & Box Model */
  display: inline-block;
  overflow: hidden;
  width: 100px;
  height: 100px;
  margin: 10px;
  padding: 10px;
  border: 10px solid #333;

  /* Text */
  text-align: right;
  font-family: sans-serif;
  font-size: 16px;
  line-height: 1.4;

  /* Color */
  background: #000;
  color: #fff;

  /* Other */
  cursor: pointer;
  z-index: 10;
}
```
