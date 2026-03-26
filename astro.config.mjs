import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";

import tunnel from "astro-tunnel";

import expressiveCode from "astro-expressive-code";

// import purgecss from "astro-purgecss";

// https://astro.build/config
export default defineConfig({
  site: "https://mcss.dev",
  integrations: [
    preact(),
    expressiveCode({
      themes: ["github-dark"],
      styleOverrides: {
        codeFontFamily:
          "Dank Mono, Inconsolata, Fira Mono, SF Mono, Monaco, Droid Sans Mono, Source Code Pro, Cascadia Code, Menlo, Consolas, DejaVu Sans Mono, ui-monospace, monospace",
        codeFontSize: "0.9rem",
        codeBackground: "#353c45", // --base-900
        uiFontFamily:
          "Avenir, Montserrat, Corbel, URW Gothic, source-sans-pro, ui-sans-serif, sans-serif",
        frames: {
          terminalBackground: "#353c45", // --base-900
          terminalTitlebarBackground: "#353c45", // --base-900
          terminalTitlebarBorderBottomColor: "#23282e", // --base-950
          shadowColor: "none",
          tooltipSuccessBackground: "#13886d", // --success-500
        },
      },
      defaultProps: {
        wrap: true, // Enable word wrap by default
        overridesByLang: {
          "ansi,bash,bat,batch,cmd,console,fish,nu,nushell,powershell,ps,ps1,psd1,psm1,sh,shell,shellscript,shellsession,zsh":
            { frame: "none", preserveIndent: false },
        },
      },
    }),
    mdx(),
    tunnel(),
  ],
});
