---
title: "mCSS 1.0"
pubDate: 2026-07-21T12:00:00-07:00
author: "Yann"
tags: ["mCSS", "version history", "components", "themes"]
description: "mCSS 1.0 is here! Revamped native layers cascade system, swappable themes, complete marketing starter template, copy + paste prebuilt dist file, and so much more…"
---

## It's 1.0!

When I released [v.0.9](/blog/mcss-v09), I said the official launch would wait until the component library and the theming system were real. They are now, so here it is: **mCSS 1.0**.

Everything is still pure CSS (plus optional Astro components), still a copy + paste in your project install. No package, no worries about version upgrades that are not supposed to break anything but end up ruining your Tuesday night anyway… Grab [`dist/mcss.css`][dist] or the source files, to make them yours!

## The component library

The [component library][components] went from "a couple of components" to 26 documented components, covering everything a content or marketing site needs: cards, heroes, FAQs, testimonials, pricing tables, header with mobile menu, footer… Each one is plain HTML and CSS first, or an Astro component if you want it.

None of it is theoretical: every component is used on this very site.

## Themes

The part I'm happiest about. A [theme][themes] in mCSS is one CSS file that restyles your whole site. Themes get their own cascade layer, sitting above the framework and below your own CSS, so a theme beats every default without ever competing with your code.

To show how the system can do more than swap colors, 1.0 ships with a [wireframe theme][themes]: hand-drawn styles with wobbly borders, paper-cutout shadows, and per-element sketch variation, all done in CSS.

## A template to start from

New in 1.0: a complete [marketing one-pager][template] built with mCSS and the component library you can use as a starter file. Just copy it, swap the words, add you own theme, ship. There's a switcher on the live page that flips it between the default and wireframe themes, so you can see how it works.

More templates are coming! And if you come up with a cool one, I'll definitely feature it here.

## Everything else

The full list of changes since 0.9, including the breaking renames, is in the [changelog][changelog]. The short version:

- Native cascade layers everywhere
- A bunch of components
- New layouts
- A `dist/` folder with copy + paste version of mCSS if you don't want to build it yourself
- Much better documentation with component playgrounds
- MIT license
- Tons of small improvements throughout

If you build something with mCSS, I'd love to see it. Come say hi in the [discussions][discussions].

[dist]: https://github.com/minimaldesign/mCSS/blob/main/dist/mcss.css
[components]: /components/start
[themes]: /docs/themes
[template]: /templates/marketing
[changelog]: https://github.com/minimaldesign/mCSS/blob/main/CHANGELOG.md
[discussions]: https://github.com/minimaldesign/mCSS/discussions
