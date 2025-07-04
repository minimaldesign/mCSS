import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";

import tunnel from "astro-tunnel";

import sentry from "@sentry/astro";
import spotlightjs from "@spotlightjs/astro";

// import purgecss from "astro-purgecss";

// https://astro.build/config
export default defineConfig({
  site: "https://mcss.dev",
  integrations: [
    preact(),
    mdx(),
    tunnel(),
    sentry(),
    spotlightjs(),
  ],
});