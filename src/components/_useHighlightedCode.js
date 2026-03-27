import { useState, useEffect, useRef } from "preact/hooks";
import { highlight } from "../scripts/shikiHighlighter.js";

export function useHighlightedCode(code, lang) {
  const [html, setHtml] = useState(null);
  const pending = useRef(0);

  useEffect(() => {
    const id = ++pending.current;
    highlight(code, lang).then((result) => {
      if (id === pending.current) setHtml(result);
    });
  }, [code, lang]);

  return html;
}
