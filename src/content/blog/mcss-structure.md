---
title: "mCSS structure and organization"
pubDate: 2024-07-22T20:30:00-07:00
author: "Yann"
tags: ["mCSS", "basics"]
description: "An overview of how and why mCSS file structure is organized the way it is. And a quick overview of how the selector’s properties are organized within CSS files."
---

## File structure

If you look at the imports in `_global.css` [on Github][1], you'll get the basic idea behind mCSS structure. The order in which the files are imported is critical. It keeps CSS specificity working _for_ us as opposed to specificity wars and cascading conflicts. This architecture is based on [ITCSS][itcss]. The basic idea is to organize CSS from least specific/broadest reach to most specific/local override so you get a smooth [specificity graph][graph] trending upward.

- Tokens: where all the global variables are set.
- Themes: easy way to override tokens globally.
- Base: your reset and normalize rules.
- Elements: HTML elements defaults, without any classes.
- Global: layouts like `.wrap` and `.grid` and global styling like `.prose`.
- Pages: page specific styling.
- Components: component specific styling.
- External: code from plugins, other libraries, etc.
- Helpers: high specificity local overrides.

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

[1]: https://github.com/minimaldesign/mCSS/blob/main/src/styles/_global.css
[itcss]: /blog/what-is-itcss
[graph]: https://jonassebastianohlsson.com/specificity-graph/
[docs]: /docs/start
