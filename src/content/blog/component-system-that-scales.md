---
title: "Building a component system that scales"
pubDate: 2026-07-28T12:00:00-07:00
author: "Yann"
tags: ["mCSS", "css", "basics", "learn"]
description: "The one rule that makes a component system scale: a selector may only contain classes from its own block. What coupling looks like, why it quietly rots a codebase, and the correct way to create context with mixed classes, tokens, and themes."
---

When I was in charge of the design system in a big company we'll keep anonymous here, I can't remember how many times I had to reject PRs from devs who made that same mistake over and over. So it's a good idea to really sit down and get a good handle on this particular pitfall that makes most JS devs give up and slap Tailwind on everything instead of learning how CSS works…

Once you get it, it's actually really simple: **a selector may only contain classes from its own block.** Never write a selector that reaches into another component. Not its block class, not its element classes, not "just this once for the border color."

The [layer system](/docs/start#mcss-file-structure) protects you from specificity wars with the framework. This rule protects you from something worse: specificity wars with yourself, six months from now. It deserves more than a bullet point, so here is the full explanation, with examples.

## What coupling looks like

Say you're building a pricing section, and the plan cards should pop a little: primary border, bigger title. The path of least resistance looks like this:

```css
/* component.pricing.css */
.pricing .card {
  border-color: var(--primary-500);
}

.pricing .card_title {
  font-size: var(--text-lg);
}
```

It works. It ships. It is also the seed of every unmaintainable stylesheet you have ever inherited.

Coupling doesn't always look that obvious. All of these are the same mistake:

```css
/* Reaching down into a component from a page class */
.home .section_title {
  text-transform: uppercase;
}

/* Reaching from a layout scaffold into a component */
.sidebar .bt {
  width: 100%;
}

/* Reaching from one component's element into another component */
.faq_content .notice {
  margin-block: var(--sm1);
}
```

Two different blocks' names in one selector. That's the whole test.

## Why it rots a codebase

**The component's file stops telling the truth.** `component.card.css` is supposed to be the one place that defines what a card looks like. The moment `.pricing .card` exists, it isn't anymore: a card's real appearance is now `component.card.css` plus whatever every other file in the project has to say about cards. To answer "why does this card look different here?" you have to read the entire codebase.

**Refactoring becomes a minefield.** Rename `.card_title` to `.card_heading` and the coupled selector in `component.pricing.css` doesn't throw an error. It just silently stops matching, and the pricing page quietly loses its bigger titles. Nothing in `component.card.css` warns you that outside files depend on its internals, because dependencies written as descendant selectors are invisible from the component's side.

**Deleting becomes impossible.** Want to swap the card component for something new? Every `.card` mention scattered across other files is a booby trap. The cost of replacing one component becomes proportional to the size of the whole project.

**Specificity starts climbing.** `.pricing .card` beats `.card`. So the next person who needs to override it inside pricing writes `.pricing .card.card`, or worse.

## The correct way to create context

Your block's opinion about a card belongs to your block. So put your block's class on the card's markup, next to the card's own classes, and style that:

```html
<article class="card pricing_planCard">
  <h3 class="card_title pricing_planTitle">Pro</h3>
  <div class="card_content">Everything in Free, plus the good stuff.</div>
</article>
```

```css
/* component.pricing.css */
.pricing_planCard {
  border-color: var(--primary-500);
}

.pricing_planTitle {
  font-size: var(--text-lg);
}
```

Same result, radically different dependency graph. `component.card.css` is once again the whole truth about cards. `component.pricing.css` only mentions classes it owns. Rename or replace the card and nothing in pricing breaks, because pricing never knew the card's internals existed. And the [naming](/docs/start#mcss-classes-syntax) does the bookkeeping for free: `.pricing_planCard` reads as "the pricing block's planCard element", so you always know which file it lives in.

## mCSS specifics

### Tokens

mCSS components expose their look through [tokens](/docs/tokens). So if the token exists, you can set the component's styling without targeting any element at all:

```css
/* component.pricing.css */
.pricing_planCard {
  --card-border-color: var(--primary-500);
  --card-shadow: var(--shadow-xl);
}
```

When a component token exists for the thing you want to change, use it before writing CSS of your own.

### Built-in components

When you're not writing your own components, you can't add classes to their markup. mCSS components solve this with `<part>Class` props, which mix your class onto the internal part for you:

```astro
<FeatureItem
  class="pricing_perk"
  titleClass="pricing_perkTitle"
  title="Unlimited projects"
/>
```

Same pattern, delivered by prop instead of typed by hand.

### When the token/prop doesn't exist

Sometimes the component has no token and no `<part>Class` prop for what you're after. The answer is still not a descendant selector, nor editing the framework files. You own your copy of mCSS, so you _can_ edit the framework files if you really want to, but I'd recommend these options instead:

1. Override it from your [theme](/docs/themes). The recommended way to override framework classes.
2. Override it through classes you mix on from your own `site/` CSS, as above.
3. If the component genuinely fights what you need, stop bending it: build your own site component and use that instead. A `component.planCard.css` you fully own beats a framework card held together with exceptions.

### What is not coupling

The rule bans crossing block boundaries, not everything that isn't a class:

- **HTML elements inside a small self-contained block**: `.tags li` and/or `.tags a`.
- **`.is-*` state classes** scoped inside your block: `.avatar.is-online` stays within the avatar.
- **ARIA attribute selectors** are better than state classes when the attribute already exists: `[aria-current]`, `[aria-expanded="true"]`.

**None of these reach into another component.** They describe your own block's markup/state.

### The two exceptions

**Theme files.** A theme's entire job is to restyle other people's blocks, deliberately and in one place. That is why `theme.*.css` is the one kind of file allowed to select framework classes, framework globals, and bare elements from outside. The exception is safe because it is bounded: at most one theme is active, and you always know where to look.

**The print sheet.** `global.print.css` holds every `@media print` rule in the project, including rules that select other blocks' classes, because a printed page is one design decision that should be readable in one file. The [Getting Started docs](/docs/start#print-styles) cover the reasoning.

## The self-check

Before you commit a stylesheet, scan your selectors and ask one question: does any selector contain names from two different blocks? If yes, reach for the ladder in order: mix your own class on, turn a component token, use a `<part>Class` prop, move it to the theme, or build your own component.

Your future self, staring at a card that looks wrong on exactly one page, will thank you.
