import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import toml from '@fbraem/rollup-plugin-toml';
import serve from 'rollup-plugin-serve'
import babel from '@rollup/plugin-babel';
import css from 'rollup-plugin-css-only';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';


const production = !process.env.ROLLUP_WATCH;


const babelPreset = {
  exclude: ['node_modules/**'],
  babelHelpers: 'runtime',
  extensions: ['.js', '.mjs', '.html', '.svelte'],
  "presets": [
    ["@babel/preset-env",
      {"targets": {
        "chrome": "55",
        "firefox": "45",
      }},
    ]
  ],
  "plugins": [
      ["@babel/transform-runtime"]
  ],
}


export default [{
    input: 'src/main.js',
    output: {
      sourcemap: !production,
      format: 'iife',
      name: 'app',
      file: 'dist/build/bundle.js'
    },
    watch: { clearScreen: true },
    plugins: [
      toml(),
      svelte({ compilerOptions: {	dev: !production	}}),
      css({ output: 'bundle.css' }),
      json(),
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      commonjs(),
      production && babel(babelPreset),
      production && terser(),       // Minify only on production
      !production && serve({         // Open browser on watch
        open: true,
        contentBase: '../',
        openPage: '/magebook/dist/index.html',
        host: '0.0.0.0',
        port: 10015,
      }),
    ],
  },
]