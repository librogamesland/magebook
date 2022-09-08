import {encodeToHTML, sanitizeProperties} from '../encoder.js'
import {extractIndexedBook } from '../book-utils'


const mimetype = 'text/html'
const extension = 'html'



const template =  (title, author, toc, body, properties) => `<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width,initial-scale=1'>
  <meta name="author" content="${author}">


  <title>${title}</title>
  <style>
    body { margin: 30px calc(37vw - 100px); }
    body, html { font-family: ${properties.textFont.family}; font-size: ${properties.textFont.size};}
    h1 { text-align: center;}
    .text { margin-bottom: 5rem; text-align: justify;}
    .text > div.space  { margin: 6px 0; line-height: ${properties.textFont.spacing};  }
    h2 { 
      page-break-before: always; page-break-after: never; padding-top: 1rem;
      font-family: ${properties.titleFont.family}; font-size: ${properties.titleFont.size}; line-height: ${properties.titleFont.spacing};  
    }
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
      result+= `\n<div class="text" for="${renamedKey}"><span class="chapter title" id="${renamedKey}">${renamedTitle}</span>\n${encodeToHTML(text, renderer(indexedBook, properties)).trim() || ``}\n<div><br></div><div><br></div></div>\n`

    }else{
      result+= `\n\n<h2 class="chapter title" id="${renamedKey}">${renamedTitle}</h2>\n`
      
      // Add chapter text (or blank line if chapter is empty)
      result+= `\n<div class="text" for="${renamedKey}">\n${encodeToHTML(text, renderer(indexedBook, properties)).trim() || ``}\n<div><br></div><div><br></div></div>\n`
    }
  }

  // sanitize
  const t = document.createElement("p")
  t.innerHTML = result
  result = t.innerHTML


  const encodedBook = template(indexedBook.properties.title, indexedBook.properties.author, toc, result, properties) //.split('\n').map( line  => line.trim()).join('')
  return {encodedBook, mimetype, extension }

}



export default { encode, mimetype }


