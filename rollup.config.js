import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import toml from '@fbraem/rollup-plugin-toml';
import serve from 'rollup-plugin-serve'
import babel from '@rollup/plugin-babel';
import css from 'rollup-plugin-css-only';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import autoPreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';



const production = !process.env.ROLLUP_WATCH;


const babelPreset = {
  exclude: ['node_modules/**'],
  babelHelpers: 'runtime',
  extensions: ['.js', '.mjs', '.html', '.svelte'],
  "presets": [
    ["@babel/preset-env",
      {"targets": {
        "chrome": "75",
        "firefox": "65",
      }},
    ]
  ],
  "plugins": [
      ["@babel/transform-runtime", { corejs: 3 }]
  ],
}


export default [{
    input: 'src/mode-markdown.js',
    output: {
      file: 'editor/static/ace/mode-markdown.js',
    },
    plugins: [
      production && terser(),        // Minify only on production
    ]
  }, {
    input: 'src/main.js',
    output: {
      sourcemap: !production,
      format: 'iife',
      name: 'app',
      file: 'editor/build/bundle.js'
    },
    watch: { clearScreen: true },
    plugins: [
      toml(),
      svelte({ 
        compilerOptions: {	dev: !production	},
        preprocess: autoPreprocess()
      }),
      typescript({ sourceMap: !production }),
      css({ output: 'bundle.css' }),
      json(),
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      commonjs(),
      production && babel(babelPreset),
      production && terser(),        // Minify only on production
      !production && serve({         // Open browser on `npm run dev`
        open: true,
        contentBase: '../',
        openPage: '/magebook/editor/index.html',
        host: '0.0.0.0',
        port: 10015,
      }),
    ],
  },
]