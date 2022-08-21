import {encodeToHTML, mangle, sanitizeProperties} from '../encoder.js'
import {extractIndexedBook } from '../book-utils'


const mimetype = 'text/html'


const template =  (title, author, toc, body, properties) => `<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width,initial-scale=1'>
  <meta name="author" content="${author}">


  <title>${title}</title>
  <style>
    body { margin: 30px calc(26vw - 70px); }
    body, html { font-family: ${properties.textFont.family}; font-size: ${properties.textFont.size};}
    h1 { text-align: center;}
    p  { margin-bottom: 8rem; line-height: ${properties.textFont.spacing};  }
    h2 { 
      margin-bottom: -1rem; line-height: 4rem; page-break-before: always;
      font-family: ${properties.titleFont.family}; font-size: ${properties.titleFont.size}; line-height: ${properties.titleFont.spacing};  
    }
    br { margin-bottom: 8px; content: ""; display: block; }
  </style>
</head>
<body>
<p style="display:none">
${toc}
</p>

<h1>${title}</h1>
${body}
</body>
</html>`




const renderer = (indexedBook, properties, currentChapter) => ({
  html:      text => text,
  paragraph: text => `${text}<br>\n`,
  strong:    text => `<b>${text}</b>`,
  em:        text => `<i>${text}</i>`,
  codespan:  () => '',
  code:      () => '',
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

  let toc = ''
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

    toc += `  <a href="#${renamedKey}">${renamedTitle}</a>\n`


    if(properties.titleStyle == 'inline'){   
      // Add chapter text (or blank line if chapter is empty)
      result+= `\n<p for="${renamedKey}"><span class="title" id="${renamedKey}">${renamedTitle}</span>\n${encodeToHTML(text, renderer(indexedBook, properties)).trim() || ``}\n</p>\n`

    }else{
      result+= `\n\n<h2 class="title" id="${renamedKey}">${renamedTitle}</h2>\n`
      
      // Add chapter text (or blank line if chapter is empty)
      result+= `\n<p for="${renamedKey}">\n${encodeToHTML(text, renderer(indexedBook, properties)).trim() || ``}\n</p>\n`
    }
  }

  // sanitize
  const t = document.createElement("p")
  t.innerHTML = result
  result = t.innerHTML


  return template(indexedBook.properties.title, indexedBook.properties.author, toc, result, properties) //.split('\n').map( line  => line.trim()).join('')
}

export default { encode, mimetype }