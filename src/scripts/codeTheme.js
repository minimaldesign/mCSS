// Shiki's github-dark with its comment color raised from #6a737d (3.05:1
// on #24292e) to #8b949e (4.77:1), so comments in code blocks pass AA.
// Pass it as `theme` to Astro's <Code>. Expressive Code (docs, blog)
// already raises low-contrast token colors on its own.

import githubDark from "@shikijs/themes/github-dark";

const commentColor = "#6a737d";

export const codeTheme = {
  ...githubDark,
  tokenColors: githubDark.tokenColors.map((rule) =>
    rule.settings?.foreground?.toLowerCase() === commentColor
      ? { ...rule, settings: { ...rule.settings, foreground: "#8b949e" } }
      : rule,
  ),
};
