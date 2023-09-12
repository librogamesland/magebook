//@ts-nocheck
import { defineConfig } from 'vite'
import toml from '@fbraem/rollup-plugin-toml';







export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: "dist",
    sourcemap: true,
    lib: {
      entry: {
        magebook: "./src/api.ts",
      },
      formats: ["es", "cjs"],
    },
  },
});
