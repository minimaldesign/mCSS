/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

/* These postcss plugins ship no type declarations (postcss-preset-env
   only lacks them for require/CJS); shorthand ambient modules keep
   astro check quiet where they're imported. */
declare module "postcss-mixins";
declare module "postcss-import";
declare module "postcss-preset-env";

/* The mCSS grid API styles plain attributes: col/col-md/col-lg/col-xl on
   .grid, span/span-md/span-lg/span-xl on .grid_item (see
   src/styles/framework/global.grid.css). Declaring them on the base
   HTMLAttributes interface lets them type-check on any element in .astro
   templates. */
declare namespace astroHTML.JSX {
  interface HTMLAttributes {
    col?: string | number | null;
    'col-md'?: string | number | null;
    'col-lg'?: string | number | null;
    'col-xl'?: string | number | null;
    span?: string | number | null;
    'span-md'?: string | number | null;
    'span-lg'?: string | number | null;
    'span-xl'?: string | number | null;
  }
}
