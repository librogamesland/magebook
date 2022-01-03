import {template} from './fodt-template.js'
import {encodeToHTML, mangle} from '../encoder.js'
import {extractIndexedBook } from '../book-utils'


const mimetype = 'application/vnd.oasis.opendocument.text'


const renderer = (chapters) => ({
  html:      text => mangle(text),
  paragraph: text => `<text:p text:style-name="Standard">${text}</text:p>`,
  strong:    text => `<text:span text:style-name="bold">${text}</text:span>`,
  em:        text => `<text:span text:style-name="italic">${text}</text:span>`,
  codespan:  () => '',
  code:      () => '',
  link: (fullKey, i, text) => {
    const key = fullKey.replace('#', '')
    console.log(key)
    return `<text:a xlink:type="simple" xlink:href="#mage${key}" text:style-name="Internet_20_link" text:visited-style-name="Visited_20_Internet_20_Link">${
      text.trim() || (chapters.has(key) ? (chapters.get(key).title.trim() || key) : key)
    }</text:a>`
  },
})

const bookmark = (key, text) =>
`<text:span text:style-name="bold"><text:bookmark-start text:name="mage${key}"/>${text}<text:bookmark-end text:name="mage${key}"/></text:span>`




const encode = (bookText) => {
  const indexedBook = extractIndexedBook(bookText)

  // Some config
  const shouldBreakLine = false

  let result = ''
  for(const [key, {title, text}] of indexedBook.chapters){ 
    // Add chapter heading
    result+= `<text:p text:style-name="Heading_3" text:outline-level="3">${bookmark(key, title.trim() || key)}</text:p>`
    
    // Add chapter text (or blank line if chapter is empty)
    result+= encodeToHTML(text, renderer(indexedBook.chapters)).trim() || `<text:p text:style-name="justify"> </text:p>`

    // Add blank line after chapter
    result +=  `<text:p text:style-name="${shouldBreakLine ? 'break' : 'Standard'}"/>`
  }

  return template(result).split('\n').map( line  => line.trim()).join('')
}

export default { encode, mimetype }