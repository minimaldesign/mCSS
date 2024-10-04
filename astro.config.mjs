import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";

// import purgecss from "astro-purgecss";

// https://astro.build/config
export default defineConfig({
  site: "https://mcss.dev",
  integrations: [preact(), mdx()],
});
