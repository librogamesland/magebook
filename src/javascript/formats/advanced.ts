import {encodeToHTML, sanitizeProperties} from '../encoder.js'
import {extractIndexedBook } from '../book-utils'





const renderer = (indexedBook, properties, currentChapter) => ({
  html:      text => text,
  paragraph: text => `${text}<br><div class="space"></div>\n`,
  strong:    text => `<b>${text}</b>`,
  em:        text => `<i>${text}</i>`,
  codespan:  () => '',
  code:      () => '',
  br:        () => '<br><div class="space"></div>',
  link: (fullKey, i, text) => {
    
    const key = fullKey.replace('#', '').trim()
    const renamedKey = properties.renameAnchor({
      key,
      book: indexedBook
    })
    const chapter = indexedBook.chapters.has(key) ? indexedBook.chapters.get(key) : null

    return `<a href="#${renamedKey}">${properties.renameLink({
      book: indexedBook,
      text: text.trim(), 
      chapter,
      title: chapter ? chapter.title : null,
      key,
      currentChapter,

    })}</a>`
  },
})



const encode = (bookText) => {
  const indexedBook = extractIndexedBook(bookText)
  const properties = sanitizeProperties(indexedBook.properties)

  const result = {
    properties: indexedBook.properties,
    toc: [],
    titles: {},
    chapters: {},
  }


  for(const [key, chapter] of indexedBook.chapters){ 

    result.toc.push(key)
    
    const {text, title } = chapter

    if(title) result.titles[key] = title

    // sanitize and convert
    const t = document.createElement("p")
    t.innerHTML = encodeToHTML(text, renderer(indexedBook, properties)).trim() || ``
    result.chapters[key] = t.innerHTML

  }


  const encodedBook = `window.magebook = ${JSON.stringify(result, null, 2)}` //.split('\n').map( line  => line.trim()).join('')

  return { encodedBook, mimetype: 'text/javascript', extension: 'js'}
}



export default { encode }


