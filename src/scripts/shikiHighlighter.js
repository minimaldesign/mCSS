// Shared Shiki highlighter for client-side syntax highlighting.
// Uses the same "github-dark" theme as Expressive Code in astro.config.mjs,
// with comments raised to AA contrast (codeTheme.js). If you change the theme
// there, update codeTheme.js to match.

import { createHighlighterCore } from "shiki/core";
import { codeTheme } from "./codeTheme.js";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

let highlighterPromise = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [codeTheme],
      langs: [import("@shikijs/langs/css"), import("@shikijs/langs/html")],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

export async function highlight(code, lang) {
  const highlighter = await getHighlighter();
  const html = highlighter.codeToHtml(code, {
    lang,
    theme: "github-dark",
    structure: "inline",
  });
  return `<span class="shiki">${html}</span>`;
}
