---
title: "What is BEM?"
pubDate: 2024-03-15
author: "Yann"
tags: ["css", "basics", "tutorial", "learn"]
description: "BEM, which stands for Block, Element, Modifier, is a popular CSS naming convention that provides a clear and structured way to name your classes, making them more meaningful and easier for teams to understand, especially in larger projects."
---

BEM, which stands for Block, Element, Modifier, is a popular CSS naming convention developed by Yandex. It provides a clear and structured way to name your classes, making them more meaningful and easier for teams to understand, especially in larger projects.

### BEM structure

The BEM naming convention follows this pattern:

- **Block**: Represents a standalone component. For example, `.site-search`.
- **Element**: A part of the block that cannot exist independently. For instance, `.site-search__field` is an element of `.site-search`.
- **Modifier**: A variation of a block or element that changes its appearance or behavior, like `.site-search--full`.

Using double hyphens and underscores helps keep the naming organized. For example:

```css
.site-search {
}

.site-search__field {
}

.site-search--full {
}
```

This structure allows developers to quickly understand the relationships between different components just by looking at their names.

### Why use BEM?

BEM enhances code readability and maintainability. When you see a class like `.person__hand--left`, it’s clear that it refers to the left hand of a person block. In contrast, using generic names like `.hand` or `.left-hand` can create confusion about their context.

Here’s an example of how BEM improves clarity:

```html
<form class="site-search site-search--full">
  <input type="text" class="site-search__field" />
  <input type="submit" value="Search" class="site-search__button" />
</form>
```

In this case, it’s immediately apparent that `site-search` is the main component, with `site-search__field` as an input element and `site-search--full` indicating a specific state.

### Common Misconceptions

Some developers find BEM's syntax visually unappealing. However, the clarity and organization it brings to your code far outweigh any aesthetic concerns. The goal is to create a consistent and understandable codebase that is easy to maintain.

### When Not to Use BEM

While BEM is powerful, it's not always necessary. For simple styles that don’t require complex relationships, such as standalone rules like `.caps { text-transform: uppercase; }`, using BEM may be overkill. It's essential to know when to apply it based on the context of your project.

### Conclusion

Adopting BEM can significantly improve your front-end development workflow by making your CSS more modular and maintainable. While it may take some getting used to, the benefits in clarity and structure are invaluable for any developer working on collaborative projects. Give BEM a try—it could be the key to cleaner, more efficient code!

#### Resources

- https://getbem.com/naming/
- https://en.bem.info/methodology/css/
- https://css-tricks.com/bem-101/
