---
title: "What is mCSS?"
pubDate: 2024-06-18T16:00:00-07:00
author: "Yann"
tags: ["mCSS", "basics"]
description: "mCSS is a minimal CSS framework for people who love CSS."
---

## mCSS philosophy

CSS is simple, but it's not easy. You can pick up the basic idea in a few hours, but mastering it requires years of experience. It's because, even though it is a programming language, it's much more "language" than "programming" because it describes design, not functionality.

Knowledge of other languages won't help you master CSS faster. It is its own beast. If you interpret that as CSS being broken and want to "fix it" to make it work like say… JavaScript, you're probably better off using something like Tailwind.

On the other hand, if you appreciate the simple elegance of the cascade, if you understand and respect [why your CSS should never be more explicit than it needs to][1], if you care about clean readable code, and appreciate good design… This framework might be for you.

## Why mCSS?

mCSS is full featured but light, opinionated but flexible, a pleasure to use but scalable. You don't need to learn some weird pseudo CSS to use it. It's actual CSS… It just takes care of all the tedious stuff for you and then gets out of the way. And you won't need a bunch of tooling around it. It will speeds up your workflow right away.

mCSS is a CSS framework that respects and takes advantage of CSS inherent strengths. It does not try to abstract CSS inner workings with a fugly Frankenstein crossover between JavaScript and inline styles. The result is code that is easy to read and understand, and to expand on. Creating component based systems is fast, efficient, easy, and headache free.

mCSS borrows from tried and tested methodologies like [ITCSS](/blog/what-is-itcss) and [BEM](/blog/what-is-bem), as well as some of the latest tech like [Open Props](https://open-props.style), and it remixes/expands on all that to create its own thing.

The mCSS framework is pure CSS. So you can use it with absolutely any tech stack you'd like. Just import the CSS files you need in your project, and you're done! The [components][2] (coming soon!) come in two flavors: plain HTML or [Astro][3].

Also… If you want to add a button to your app, your code will look like that:

```html
<button class="btn btn-primary">mCSS Button</button>
```

**Not** like that…

```html
<button
  class="bg-indigo-600 px-4 py-3 text-center text-sm font-semibold inline-block text-white cursor-pointer uppercase transition duration-200 ease-in-out rounded-md hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 active:scale-95"
>
  Frankenstein Button
</button>
```

**To get all the details, head over to the docs [Getting Started][4] section!**

[1]: https://css-tricks.com/why-is-css-frustrating/
[2]: /components/start
[3]: https://astro.build
[4]: /docs/start
