---
title: "What is ITCSS?"
pubDate: 2024-02-28
author: "Yann"
tags: ["css", "basics", "tutorial"]
description: "ITCSS is a scalable, managed, CSS architecture"
---

[ITCSS](/news/what-is-itcss) (Inverted Triangle CSS) is a CSS architecture developed by [Harry Roberts](https://twitter.com/csswizardry). It helps organize your CSS files to better handle challenges like global namespaces, cascading styles, and selector specificity. It works with or without preprocessors and is compatible with methodologies like **BEM**, **SMACSS**, and **OOCSS**.

The main idea is to separate your CSS into several layers represented as sections of an inverted triangle:

## ITCSS Layers

- **Settings**: Define fonts, colors, etc. using preprocessors.
- **Tools**: Globally used mixins and functions. No actual CSS output in the first two layers.
- **Generic**: Reset/normalize styles, box-sizing definition. First layer generating CSS.
- **Elements**: Style bare HTML elements (H1, A, etc.), overriding browser defaults.
- **Objects**: Class-based selectors defining undecorated design patterns (e.g., media object).
- **Components**: Specific UI components, where most work happens. Often composed of Objects and Components.
- **Utilities**: Helper classes that can override anything above in the triangle.

The triangle shows how styles cascade from generic to explicit, low to high specificity, and far-reaching to localized.

## ITCSS Key Metrics

This organization helps avoid Specificity Wars and maintains a healthy specificity graph.

## Tips for Using ITCSS

- **Adjust ITCSS to Your Needs**: Not all layers are required; you can customize based on your workflow. A minimal setup might just include components with default styles from the browser.

- **Use BEMIT Naming Convention**: Implement namespaces (e.g., `.c-user`, `.o-media`) to streamline naming and focus on solving front-end challenges.

- **Organize Layers into Subfolders**: Keep your ITCSS layers tidy by organizing them into subfolders. Use a preprocessor to compile added files:

```css
@import "settings/*";
@import "tools/*";
@import "generic/*";
@import "elements/*";
@import "vendor/*";
@import "objects/*";
@import "components/*";
@import "utilities/*";
```

## Tips

One File per Component: Store each component in its own file to avoid mixing styles. This keeps your codebase clean and manageable.

Limit Nesting: Keep nesting to a maximum of two levels. A flat structure with full selectors can be easier to scan and maintain.

Be Cautious with Objects: Objects can become confusing. Consider omitting them entirely or nesting them within components to prevent clutter.

Separate Spacing System from Components: Avoid adding margins directly to components. Instead, use wrapper or spacer components, or create utility classes for margins and spacing.

Don’t Worry About Style Repetition: While some repetition is inevitable, it’s often easier to manage repeated styles across independent components than to track down complex abstractions.

## Conclusion

ITCSS is an effective choice for projects without built-in CSS scoping (like WordPress) and works well in environments with scoped CSS (such as React). It offers a straightforward yet powerful architecture that facilitates the creation of scalable and maintainable CSS for projects of any size.
