import {template} from './fodt-template.js'
import {marked, encodeToHTML, mangle, sanitizeProperties} from '../encoder.js'
import {extractIndexedBook } from '../book-utils'


const mimetype = 'application/vnd.oasis.opendocument.text'

const whitemap = {
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

/*
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
})*/



const whitelist = ['<b>', '</b>', '<i>', '</i>', '<u>', '</u>']

const inlineRenderer = () => ({
  html:      text => whitelist.includes(text.trim().toLowerCase()) ? text.trim().toLowerCase() : mangle(text),
  paragraph: text => `${text}`,
  strong:    text => `<b>${text}</b>`,
  em:        text => `<i>${text}</i>`,
  codespan:  () => '',
  code: () => '',
  link: () => '',
})

const renderer = (indexedBook, properties, currentChapter) => ({
  html:      text => whitelist.includes(text.trim().toLowerCase()) ? text.trim().toLowerCase() : mangle(text),
  paragraph: text => `<p>${text}</p>`,
  strong:    text => `<b>${text}</b>`,
  em:        text => `<i>${text}</i>`,
  codespan:  text => '',
  code: (code, lang) => '',
  link: (fullKey, i, text) => {
    
    const key = fullKey.replace('#', '').trim()
    const renamedKey = properties.renameAnchor({
      key,
      book: indexedBook
    })
    const chapter = indexedBook.chapters.has(key) ? indexedBook.chapters.get(key) : null

    return `<mage-link to="${renamedKey}">${encodeToHTML(properties.renameLink({
      book: indexedBook,
      text: text.trim(), 
      chapter,
      title: chapter ? chapter.title : null,
      key,
      currentChapter,

    }), inlineRenderer())}</mage-link>`
  },
})


const bookmark = (key, text) =>
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



const encode = (bookText) => {
  const indexedBook = extractIndexedBook(bookText)
  const properties = sanitizeProperties(indexedBook.properties)
  const inlineStyle = properties.titleStyle == 'inline'

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


    // Get chapter heading
    const bookmarkText = bookmark(renamedKey, renamedTitle)
    
    // Get chapter text (or blank line if chapter is empty)
    const htmlText = encodeToHTML(text, renderer(indexedBook, properties, chapter)).replaceAll('<br>', '</p><p>').trim() || `<p></p>`

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

  return template(result, properties).split('\n').map( line  => line.trim()).join('')
}

export default { encode, mimetype }