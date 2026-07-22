---
title: "mCSS 1.0"
pubDate: 2026-07-21T12:00:00-07:00
author: "Yann"
tags: ["mCSS", "version history", "components", "themes"]
description: "mCSS 1.0 is here: a full component library, a real theme system with a hand-drawn wireframe skin to prove it, and a complete marketing template you can copy and ship."
---

## It's 1.0!

When I released [v.0.9](/blog/mcss-v09), I said the official launch would wait until the component library and the theming system were real. They are now, so here it is: **mCSS 1.0**.

Everything is still pure CSS (plus optional Astro components), still a copy + paste in your project install. No package, no worries about version upgrades that are not supposed to break anything but end up ruining your Tuesday night anyway… Grab [`dist/mcss.css`][dist] or the source files, to make them yours!

## The component library

The [component library][components] went from "a couple of components" to **23 documented components**, covering everything a content or marketing site needs: cards, heroes, FAQs, testimonials, pricing tables, pagination, a header with a proper mobile menu, a footer, banners... Each one is plain HTML and CSS first, with an Astro component on top if you want it, and each docs page lists exactly which files to copy.

None of it is theoretical: every component is used on this very site.

## Themes

The part I'm happiest about. A [theme][themes] in mCSS is **one CSS file that reskins your whole site**. Themes get their own cascade layer, sitting above the framework and below your own CSS, so a theme beats every default without ever fighting your code.

To prove the system could do more than swap colors, 1.0 ships with a [wireframe theme][themes]: a hand-drawn skin with wobbly borders, paper-cutout shadows, and per-element sketch variation, done entirely in CSS.

## A template to start from

New in 1.0: a complete [marketing one-pager][template] built only from the framework and the component library. Banner, header, hero, features, testimonials, pricing, FAQ, closing CTA, footer. Copy one file, swap the words, ship. There's a switcher on the live page that flips it between the default look and the wireframe theme, so you can see the theme system do its thing on a real page.

More templates are coming! And if you come up with a cool one, I'll definitely feature it here.

## Everything else

The full list of changes since 0.9, including the breaking renames, is in the [changelog][changelog]. The short version: native cascade layers everywhere, a committed `dist/` build kept fresh by CI, an MIT license, and a lot of polish driven by a top-to-bottom audit.

If you build something with mCSS, I'd love to see it. Come say hi in the [discussions][discussions].

[dist]: https://github.com/minimaldesign/mCSS/blob/main/dist/mcss.css
[components]: /components/start
[themes]: /docs/themes
[template]: /templates/marketing
[changelog]: https://github.com/minimaldesign/mCSS/blob/main/CHANGELOG.md
[discussions]: https://github.com/minimaldesign/mCSS/discussions
