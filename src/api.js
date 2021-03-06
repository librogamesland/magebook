import md   from './javascript/formats/md.js'
import fodt from './javascript/formats/fodt.js'
import xlgc from './javascript/formats/xlgc.js'
import docx from './javascript/formats/docx.js'
import {encodeToHTML, raw, mangle } from './javascript/encoder.js'
import { createFilter } from '@rollup/pluginutils';

const htmlToText = raw
const textToHtml = mangle
const encodeChapter = encodeToHTML



const rollupMagebook = ( options = {} ) => {
  const filter = createFilter( options.include, options.exclude );
  const transform = options.transform || ((key, chapter, book) => chapter)

  return {
    transform ( file, id ) {
      if (id.slice(-3) !== '.md' || !filter(id)) return null;
      const data = md.decode(file)
      data.chapters = Object.fromEntries(Object.entries(data.chapters).map(
        ([key, value]) => [key, transform(key, value, data)]
      ))
      return {
        code: `export default ${JSON.stringify(data)}`,
        map: { mappings: '' }
      };
    }
  };
}

const formats = { md, fodt, docx, xlgc}


export {rollupMagebook, htmlToText, textToHtml, encodeChapter, formats}