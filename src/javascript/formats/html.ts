import {encodeToHTML, mangle} from '../encoder.js'
import {extractIndexedBook } from '../book-utils'


const mimetype = 'text/html'


const template =  (title, author, toc, body) => `<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width,initial-scale=1'>
  <meta name="author" content="${author}">


  <title>${title}</title>
  <style>
    body { margin: 30px calc(26vw - 70px); }
    body, html { font-family: Arial, Helvetica, sans-serif;}
    h1 { text-align: center;}
    p  { margin-bottom: 8rem; }
    h2 { margin-bottom: -1rem; line-height: 4rem; page-break-before: always;  }
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




const renderer = (chapters) => ({
  html:      text => text,
  paragraph: text => `${text}<br>\n`,
  strong:    text => `<b>${text}</b>`,
  em:        text => `<i>${text}</i>`,
  codespan:  () => '',
  code:      () => '',
  link: (fullKey, i, text) => {
    const key = fullKey.replace('#', '')

    return `<a href="#${key}">${
      text.trim() || (chapters.has(key) ? (chapters.get(key).title.trim() || key) : key)
    }</a>`
  },
})



const encode = (bookText) => {
  const indexedBook = extractIndexedBook(bookText)

  // Some config
  const shouldBreakLine = false

  let toc = ''
  let result = ''
  for(const [key, {title, text}] of indexedBook.chapters){ 
    // Add chapter heading
    toc += `  <a href="#${key}">${(title.trim() || key)}</a>\n`
    result+= `\n\n<h2 id="${key}">${(title.trim() || key)}</h2>\n`
    
    // Add chapter text (or blank line if chapter is empty)
    result+= `\n<p for="${key}">\n${encodeToHTML(text, renderer(indexedBook.chapters)).trim() || ``}\n</p>\n`

  }

  return template(indexedBook.properties.title, indexedBook.properties.author, toc, result) //.split('\n').map( line  => line.trim()).join('')
}

export default { encode, mimetype }