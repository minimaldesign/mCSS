import { useState, useRef, useCallback } from "preact/hooks";
import copyIcon from "../assets/icons/copy.svg?raw";

export default function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const pre = document.createElement("pre");
      Object.assign(pre.style, {
        position: "absolute",
        left: "-9999px",
        opacity: "0",
      });
      pre.textContent = code;
      document.body.appendChild(pre);
      const range = document.createRange();
      range.selectNode(pre);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand("copy");
      sel.removeAllRanges();
      document.body.removeChild(pre);
    }

    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  }, [code]);

  return (
    <div class="copyBtn">
      <span class={`copyBtn_feedback${copied ? " is-visible" : ""}`}>
        Copied!
      </span>
      <button
        type="button"
        class="copyBtn_trigger"
        title="Copy to clipboard"
        onClick={handleCopy}
        dangerouslySetInnerHTML={{ __html: copyIcon }}
      />
    </div>
  );
}
