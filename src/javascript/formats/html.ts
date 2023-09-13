import {encodeToHTML, sanitizeProperties, type ExportProperties, renameKeyAndTitle} from '../encoder.js'
import {bookify, type Book, chaptersOf } from '../book-utils'


const mimetype = 'text/html'
const extension = 'html'



const template =  (title : string, author: string, toc : string, body: string, properties: ExportProperties) => `<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width,initial-scale=1'>
  ${author != null ? `<meta name="author" content="${author}">` : ''}

  ${title != null ? `<title>${title}</title>` : ''}
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

${title != null ? `<h1>${title}</h1>` : ''}
${body}
</body>
</html>`




const renderer = (book : Book, properties : ExportProperties) => ({
  html:      (text : string) => text,
  paragraph: (text : string) => `${text}<br><div class="space"></div>\n`,
  strong:    (text : string) => `<b>${text}</b>`,
  em:        (text : string) => `<i>${text}</i>`,
  codespan:  () => '',
  code:      () => '',
  br:        () => '<br><div class="space"></div>',
  link: (fullKey : string, _i : string, text : string) => {

    const key = fullKey.replace('#', '').trim()
    const renamedKey = properties.renameAnchor({
      key,
      book,
    })

    const chapterIndex = book.index.keys[key]
    const chapter = (chapterIndex === undefined) ? undefined : book.index.chapters[chapterIndex]

    return `<a href="#${renamedKey}">${properties.renameLink({
      book,
      text: text.trim(),
      chapter,
      title: chapter?.title,
      key: chapter?.key,
    })}</a>`
  },
})



const encode = (bookOrText : Book | string) => {
  const book = bookify(bookOrText)
  const properties = sanitizeProperties(book.index.properties)

  let toc = ''
  let result = ''
  for(const [chapter, {content} ] of chaptersOf(book)){
    if(chapter.flags.includes('noexport')) continue
    const {renamedKey, renamedTitle} = renameKeyAndTitle(properties, book, chapter)

    toc += `  <a href="#${renamedKey}">${renamedTitle}</a>\n`


    if(properties.titleStyle == 'inline'){
      // Add chapter text (or blank line if chapter is empty)
      result+= `\n<div class="text" for="${renamedKey}"><span class="chapter title" id="${renamedKey}">${renamedTitle}</span>\n${encodeToHTML(content, renderer(book, properties)).trim()}\n<div><br></div><div><br></div></div>\n`

    }else{
      result+= `\n\n<h2 class="chapter title" id="${renamedKey}">${renamedTitle}</h2>\n`

      // Add chapter text (or blank line if chapter is empty)
      result+= `\n<div class="text" for="${renamedKey}">\n${encodeToHTML(content, renderer(book, properties)).trim()}\n<div><br></div><div><br></div></div>\n`
    }
  }

  // sanitize
  const t = document.createElement("p")
  t.innerHTML = result
  result = t.innerHTML


  const encodedBook = template(book.index.properties.title ?? book.index.title, book.index.properties.author, toc, result, properties) //.split('\n').map( line  => line.trim()).join('')
  return {encodedBook, mimetype, extension }

}



export default { encode, mimetype, extension }


