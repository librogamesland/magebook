//@ts-nocheck
import { defineConfig } from 'vite'
import toml from '@fbraem/rollup-plugin-toml';


export default defineConfig({
  build: {
    outDir: __dirname,

    emptyOutDir: false,
    sourcemap: true,
    lib: {
      fileName: 'index',
      entry: __dirname + "/main.ts",
      formats: ["es",],
    },
  },
});
