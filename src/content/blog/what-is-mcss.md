---
title: "What is mCSS"
pubDate: 2024-02-28
description: "mCSS is a minimal CSS framework for people who love CSS."
author: "Yann"
tags: ["mCSS", "basics"]
---

## mCSS philosophy

CSS is simple, but it's not easy. You can pick up the basic idea in a few hours, but mastering it requires years of experience.

Knowledge of other languages won't help you master it faster. CSS is its own beast. If you interpret that as CSS being broken and want to "fix it" to make it work like say… JavaScript, you're probably better off using something like Tailwind.

On the other hand, if you appreciate the simple elegance of the cascade, if you understand and respect [why your CSS should never be more explicit than it needs to][1]. This framework might be for you!

## Why mCSS?

mCSS is a CSS framework that respects and takes advantage of CSS inherent strengths. It does not try to abstract CSS inner workings with a fugly Frankenstein crossover between JavaScript and inline styles. The result is code that is easy to read and understand and expand on. Creating component based systems is fast, efficient, easy, and headache free.

To do that, it borrows from tried and tested methodologies like [ITCSS](/news/what-is-itcss) and [BEM](https://en.bem.info/methodology/), as well as some of the hottest new tech like [Open Props](https://open-props.style).

```html
<button
  class="bg-indigo-600 px-4 py-3 text-center text-sm font-semibold inline-block text-white cursor-pointer uppercase transition duration-200 ease-in-out rounded-md hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 active:scale-95"
>
  Frankenstein Button
</button>

<button class="btn btn-primary">mCSS Button</button>
```

[1]: https://css-tricks.com/why-is-css-frustrating/
