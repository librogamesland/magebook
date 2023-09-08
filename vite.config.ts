import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess'

import toml from '@fbraem/rollup-plugin-toml';



import fs from 'fs'
import path from 'path'




const folderPath = path.join(__dirname, 'src/plugins'); // Plugin path folder

let plugins = []
let pluginsLocalizations = []
try {
  const files = fs.readdirSync(folderPath);
  // load plugin js sources
  plugins = files.filter((file) => {
    const filePath = path.join(folderPath, file);
    return !file.startsWith('disabled') && fs.statSync(filePath).isDirectory() && fs.statSync(path.join(filePath, 'src/main.js')).isFile();
  });
  // load plugin localizations
  pluginsLocalizations = files.filter((file) => {
    const filePath = path.join(folderPath, file);
    return !file.startsWith('disabled') && fs.statSync(filePath).isDirectory() && fs.statSync(path.join(filePath, 'src/localizations.toml')).isFile();
  });
} catch (err) {
  console.error('Error:', err);
}

/*
fs.writeFileSync(path.join(__dirname, 'src/javascript/plugins.ts'), `
${plugins.map( (p, i) => `import plugin${i} from '${path.join(__dirname, 'src/plugins', p, 'src/main.js')}'`).join('\n')}
export const plugins = [ ${plugins.map( (p, i) => `plugin${i}`).join(', ')} ]
`)*/

const pluginLoader = {
  name: 'mage-plugin-loader',
  buildStart(){
    for (const plugin of plugins){
    //  this.addWatchFile(path.join(__dirname, 'src/plugins', plugin, 'src/main.js'))
    }
  },
  resolveId ( source ) {
    return (source === 'mage-plugins' || source === 'mage-plugins-localizations') ? source : null
  },
  load ( id ) {
    if (id === 'mage-plugins') {

      // Create a virtual module like:
      /*
          import plugin0 from '/absolute/path/src/plugins/PLUGIN-NAME/src/main.js'
          export const plugins = [plugin0]
      */
      return` ${plugins.map( (p, i) => `import plugin${i} from '${path.join(__dirname, 'src/plugins', p, 'src/main.js')}'`).join('\n')}
      export const plugins = [ ${plugins.map( (p, i) => `plugin${i}`).join(', ')} ]`

    }
    return null;
  }
};


export default defineConfig({
  root: 'src',
  base: './',
  build: {
    emptyOutDir: true,
    outDir: '../editor',
  },
  plugins: [
    pluginLoader,
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
