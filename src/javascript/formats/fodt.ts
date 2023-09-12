import {template} from './fodt-template.js'
import {trimHTML, encodeToHTML, mangle, sanitizeProperties, renameKeyAndTitle, type ExportProperties} from '../encoder.js'
import {bookify, type Book, chaptersOf } from '../book-utils'


const mimetype = 'application/vnd.oasis.opendocument.text'
const extension = 'fodt'


const whitemap : Record<string, string> = {
  '<p>': `<text:p text:style-name="Standard">`,
  '</p>': `</text:p>`,
  '<b>': `<text:span text:style-name="bold">`,
  '</b>': `</text:span>`,
  '<i>': `<text:span text:style-name="italic">`,
  '</i>': `</text:span>`,
  '<u>': `<text:span text:style-name="underline">`,
  '</u>': `</text:span>`,

  // Temp links
  '<mage-link to="': '<text:a xlink:type="simple" text:style-name="Internet_20_link" text:visited-style-name="Visited_20_Internet_20_Link" xlink:href="#',
  '</mage-link>': '</text:a>',
}



const whitelist = ['<b>', '</b>', '<i>', '</i>', '<u>', '</u>']

const inlineRenderer = () => ({
  html:      (text : string) => whitelist.includes(text.trim().toLowerCase()) ? text.trim().toLowerCase() : mangle(text),
  paragraph: (text : string) => `${text}`,
  strong:    (text : string) => `<b>${text}</b>`,
  em:        (text : string) => `<i>${text}</i>`,
  codespan:  () => '',
  code: () => '',
  link: () => '',
})

const renderer = (book : Book, properties : ExportProperties) => ({
  html:      (text : string) => whitelist.includes(text.trim().toLowerCase()) ? text.trim().toLowerCase() : mangle(text),
  paragraph: (text : string) => `<p>${text}</p>`,
  strong:    (text : string) => `<b>${text}</b>`,
  em:        (text : string) => `<i>${text}</i>`,
  br:        () => '</p><p>',
  codespan:  (_text : string) => '',
  code: (_code : string, _lang : string) => '',
  link: (fullKey : string, _i : string, text : string) => {

    const key = fullKey.replace('#', '').trim()
    const renamedKey = properties.renameAnchor({
      key,
      book,
    })

    const chapterIndex = book.index.keys[key]
    const chapter = (chapterIndex === undefined) ? undefined : book.index.chapters[chapterIndex]

    return `<mage-link to="${renamedKey}">${encodeToHTML(properties.renameLink({
      book,
      text: text.trim(),
      chapter,
      title: chapter?.title,
      key: chapter?.key,
    }), inlineRenderer())}</mage-link>`
  },
})


const bookmark = (key : string, text : string) =>
`<text:span text:style-name="bold"><text:bookmark-start text:name="${key}"/>${encodeToHTML(text, inlineRenderer())}<text:bookmark-end text:name="${key}"/></text:span>`


const sanitizeAndConvertToOpenOffice = (text : string) : string => {
  const t = document.createElement("p")
  t.innerHTML = text
  text = t.innerHTML

  for(const tag in whitemap){
    text = text.replaceAll(tag, whitemap[tag])
  }

  return text
}



const encode = (bookOrText : Book | string) => {
  const book = bookify(bookOrText)
  const properties = sanitizeProperties(book.index.properties)
  const inlineStyle = properties.titleStyle == 'inline'

  let result = ''
  for(const [chapter, {content}] of chaptersOf(book)){

    const {renamedKey, renamedTitle} = renameKeyAndTitle(properties, book, chapter)

    // Get chapter bookmark and text
    const bookmarkText = bookmark(renamedKey, renamedTitle)
    const htmlText = trimHTML(encodeToHTML(content, renderer(book, properties)).replaceAll('<br>', '</p><p>').trim() || `<p></p>`)

    const newChapter = sanitizeAndConvertToOpenOffice(htmlText)

    // Add them
    if(inlineStyle){
      result+= newChapter.replace('>', '>' + bookmarkText + ' ')
    }else{
      result+= `<text:p text:style-name="Heading_3" text:outline-level="3">${bookmarkText}</text:p>` + newChapter
    }


    // Add blank line after
    const shouldBreak = false
    result +=  `<text:p text:style-name="${shouldBreak ? 'break' : 'Standard'}"/>`
  }

  const encodedBook = template(result, properties).split('\n').map( line  => line.trim()).join('')
  return {encodedBook, mimetype, extension }

}

export default { encode, mimetype, extension }