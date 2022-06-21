import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'

import toml from '@fbraem/rollup-plugin-toml';



export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: '../editor',
  },
  plugins: [
    svelte({ preprocess: sveltePreprocess() }),
    toml(),
  ]
})
