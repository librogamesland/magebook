import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess'

import toml from '@fbraem/rollup-plugin-toml';



export default defineConfig({
  root: 'src',
  base: './',
  build: {
    emptyOutDir: true,
    outDir: '../editor',
  },
  plugins: [
    svelte({
      preprocess: vitePreprocess(),
      onwarn: (warning, handler) => {
          // disable a11y warnings
          if (warning.code.startsWith("a11y-")) return;
          handler(warning);
      },
    }),
    toml(),
  ]
})
