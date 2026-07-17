---
title: "mCSS structure and organization"
pubDate: 2024-07-22T20:30:00-07:00
author: "Yann"
tags: ["mCSS", "basics", "learn"]
description: "An overview of how and why mCSS file structure is organized the way it is. And a quick overview of how the selector’s properties are organized within CSS files."
---

## File structure

> **Update (2026):** mCSS now uses native [CSS cascade layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer): each file is imported into a named `@layer`, and the layer name decides priority instead of the import order. The layer structure below is unchanged, but the mechanism is more robust (and your own unlayered CSS always wins over the framework). See the [Getting Started docs][docs] for the current setup.

If you look at the imports in `mcss.css` [on Github][1], you'll get the basic idea behind mCSS structure. Each file belongs to a layer, and the layers keep the cascade working _for_ us as opposed to specificity wars and cascading conflicts. This architecture is based on [ITCSS][itcss]. The basic idea is to organize CSS from least specific/broadest reach to most specific/local override so you get a smooth [specificity graph][graph] trending upward.

- Tokens & Themes (`settings`): where all the global variables are set, and easy ways to override them.
- Base: your reset and normalize rules.
- Elements: HTML elements defaults, without any classes.
- Global: layouts like `.wrap` and `.grid` and global styling like `.prose`.
- Atoms: the smallest styling units, like `.bt` buttons.
- Components: component specific styling.
- Pages: page specific styling.
- Helpers: local overrides (last layer, so they beat everything above).
- Your own CSS imports unlayered, after the framework, and wins over all of it.

For more details on what each section does, have a look [in the docs][docs].

## CSS organization

The idea is to be able to scan a selector's property at a glance and be able to roughly know what it does and where to find what you need. It doesn't need to be super strict, but you should think about it as "outside → in" or "general → specific."

So you first write what affect your element on the page, like positioning, then what affects the element itself, like size, passing, etc. Then what affects what's inside your element, like text.

Some of it is a little arbitrary, like putting `margin` after `width` and `height`. But as long as the related properties are grouped together mostly logically, the rest is more about personal preference. It doesn't affect readability.

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

[1]: https://github.com/minimaldesign/mCSS/blob/main/src/styles/framework/mcss.css
[itcss]: /blog/what-is-itcss
[graph]: https://jonassebastianohlsson.com/specificity-graph/
[docs]: /docs/start
