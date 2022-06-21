import {template} from './fodt-template.js'
import {marked, encodeToHTML, mangle, sanitizeProperties} from '../encoder.js'
import {extractIndexedBook } from '../book-utils'


const mimetype = 'application/vnd.oasis.opendocument.text'

const whitemap = {
  '<b>': `<text:span text:style-name="bold">`, 
  '</b>': `</text:span>`,  
  '<i>': `<text:span text:style-name="italic">`, 
  '</i>': `</text:span>`,
  '<u>': `<text:span text:style-name="underline">`, 
  '</u>': `</text:span>`,
}


const sanitize = (text) => {
  const opened = (text.match(/\<text\:span/g) || []).length;
  const closed = (text.match(/\<\/text\:span\>/g) || []).length;
  if(opened < closed) return '<text:span>'.repeat(closed - opened) + text 
  if(opened > closed) return text + '</text:span>'.repeat(opened - closed)
  return text
}

const inlineRenderer = () => ({
  html:      text => whitemap[text.trim().toLowerCase()] ? whitemap[text.trim().toLowerCase()] : mangle(text),
  paragraph: text => sanitize(text),
  strong:    text => `<text:span text:style-name="bold">${text}</text:span>`,
  em:        text => `<text:span text:style-name="italic">${text}</text:span>`,
})


const renderer = (indexedBook, properties, currentChapter) => ({
  html:      text => whitemap[text.trim().toLowerCase()] ? whitemap[text.trim().toLowerCase()] : mangle(text),
  paragraph: text => `<text:p text:style-name="Standard">${sanitize(text)}</text:p>`,
  strong:    text => `<text:span text:style-name="bold">${text}</text:span>`,
  em:        text => `<text:span text:style-name="italic">${text}</text:span>`,
  codespan:  () => '',
  code:      () => '',
  link: (fullKey, i, text) => {
    const key = fullKey.replace('#', '').trim()
    const renamedKey = properties.renameAnchor({
      key,
      book: indexedBook
    })
    const chapter = indexedBook.chapters.has(key) ? indexedBook.chapters.get(key) : null
    return `<text:a xlink:type="simple" xlink:href="#${renamedKey}" text:style-name="Internet_20_link" text:visited-style-name="Visited_20_Internet_20_Link">${
      encodeToHTML(properties.renameLink({
        book: indexedBook,
        text: text.trim(), 
        chapter,
        title: chapter ? chapter.title : null,
        key,
        currentChapter,

    }), inlineRenderer())}</text:a>`
  },
})

const bookmark = (key, text) =>
`<text:span text:style-name="bold"><text:bookmark-start text:name="${key}"/>${encodeToHTML(text, inlineRenderer())}<text:bookmark-end text:name="${key}"/></text:span>`




const encode = (bookText) => {
  const indexedBook = extractIndexedBook(bookText)
  const properties = sanitizeProperties(indexedBook.properties)

  let result = ''
  for(const [key, chapter] of indexedBook.chapters){ 

    const {text} = chapter
    // Add chapter heading
    const renamedKey = properties.renameAnchor({
      key: key,
      book: indexedBook
    })

    const renamedTitle = properties.renameTitle({
      book: indexedBook,
      chapter,
      key: key,
      title: chapter.title ? chapter.title.trim() : '',

    })


    // Add chapter heading
    result+= `<text:p text:style-name="Heading_3" text:outline-level="3">${bookmark(renamedKey, renamedTitle)}</text:p>`
    
    // Add chapter text (or blank line if chapter is empty)
    result+= encodeToHTML(text, renderer(indexedBook, properties, chapter)).trim() || `<text:p text:style-name="justify"> </text:p>`

    // Add blank line after 
    const shouldBreak = false
    result +=  `<text:p text:style-name="${shouldBreak ? 'break' : 'Standard'}"/>`
  }

  return template(result, properties).split('\n').map( line  => line.trim()).join('')
}

export default { encode, mimetype }