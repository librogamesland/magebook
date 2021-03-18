import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';



const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'src/api.js',
    output: {
      format: 'commonjs',
      name: 'magebook',
      file: 'index.js'
    },
    plugins: [
      json(),
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      commonjs(),
    ],
  }