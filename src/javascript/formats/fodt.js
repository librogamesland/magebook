import {template} from './fodt-template.js'
import {isNumber} from '../utils.js'
import {encodeToHTML, raw, mangle} from '../encoder.js'
import {Book} from '../book.js'



const mimetype = 'application/vnd.oasis.opendocument.text'



const renderer = (chapters) => ({
  html:      text => mangle(text),
  paragraph: text => `<text:p text:style-name="Standard">${text}</text:p>`,
  strong:    text => `<text:span text:style-name="bold">${text}</text:span>`,
  em:        text => `<text:span text:style-name="italic">${text}</text:span>`,
  codespan:  () => '',
  code:      () => '',
  link: (key, i, text) => `<text:a xlink:type="simple" xlink:href="#mage${key.replace('#', '')}" text:style-name="Internet_20_link" text:visited-style-name="Visited_20_Internet_20_Link">${
    text.trim() || chapters[key.replace('#', '')].title.trim() || key.replace('#', '')
  }</text:a>`,
})

const bookmark = (key, text) =>
`<text:span text:style-name="bold"><text:bookmark-start text:name="mage${key}"/>${text}<text:bookmark-end text:name="mage${key}"/></text:span>`


const encodeChapter = (key, chapters) => {
  let result = ''
  const isNumeric = false //isNumber(key)

  if(!isNumeric) result+= `<text:p text:style-name="Heading_3" text:outline-level="3">${bookmark(key, chapters[key].title.trim() || key)}</text:p>`
  result += encodeToHTML(chapters[key].text, renderer(chapters))
  result = result.trim() || `<text:p text:style-name="justify"> </text:p>`
  if(isNumeric) result = result.replace('>', '>' + bookmark(key, (chapters[key].title.trim() || key) + '. '))

  result +=  `<text:p text:style-name="${isNumeric ? 'break' : 'Standard'}"/>`
  return result
}


const encode = (book) => {
  if(!book["__is_book"]) book = new Book(book)
  const {chapters} = book.get()
  const result = template(book.sortedKeys().reduce( (acc, key) => acc + encodeChapter(key, chapters), ''))
  return result.split('\n').map( line  => line.trim()).join('')
}

export default { encode, mimetype }