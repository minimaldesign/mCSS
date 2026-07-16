import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";

import tunnel from "astro-tunnel";

import expressiveCode from "astro-expressive-code";

// astro-tunnel is a dev-only tool; keep it out of production builds
const isDev = process.env.NODE_ENV !== "production" && process.argv.includes("dev");

// https://astro.build/config
export default defineConfig({
  site: "https://mcss.dev",
  // dist/ is reserved for the framework CSS artifact (npm run build:css);
  // the hosting platform's publish directory must point at _site/
  outDir: "./_site",
  redirects: {
    // slug lowercased for consistency with the other component docs
    "/components/ReadProgressBar": "/components/readprogressbar",
  },
  integrations: [
    preact(),
    expressiveCode({
      themes: ["github-dark"], // Theme also needs to be imported in shikiHighlighter.js
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
    ...(isDev ? [tunnel()] : []),
  ],
});
