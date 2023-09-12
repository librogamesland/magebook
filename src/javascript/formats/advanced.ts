/


import {encodeToHTML, sanitizeProperties, raw} from '../encoder.js'
import {bookify, type Book } from '../book-utils'



const defaultTemplate = `<!DOCTYPE html>
<html>
<head>
	<meta charset='utf-8'>
	<meta name='viewport' content='width=device-width,initial-scale=1'>
	<title>Gamebook app</title>
  <meta name="theme-color" content="rgb(47, 99, 255)">

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.2.0/css/material-design-iconic-font.min.css">
  <link rel="stylesheet" href="https://librogamesland.github.io/magebook/template/mageapp.css">
</head>
<body style="--theme-color: rgb(47, 99, 255)">

  <div id="app" v-cloak>
    <mageapp-main></mageapp-main>
  </div>

  <script src="https://unpkg.com/vue@3"></script>
  <script src="https://lucafabbian.github.io/finaldialog/dist/finaldialog.js"></script>
  <script src="https://librogamesland.github.io/magebook/template/mageapp.js"></script>
  <script>window.$magebook = %%MAGEBOOK%%</script>
  <script>
    const { createApp } = Vue

    const app = createApp()
    app.use(MageApp.plugin)
    app.mount('#app')
  </script>

</body>
</html>`



const renderer = (indexedBook, properties, selectedChapter) => ({
  html:      (text : string) => text,
  paragraph: (text : string) => `${text}<br><div class="space"></div>\n`,
  strong:    (text : string) => `<b>${text}</b>`,
  em:        (text : string) => `<i>${text}</i>`,
  codespan:  (text : string) => {
    const code = raw(text).trim();
    return code.trim().startsWith('<') && code.trim().endsWith('>') ? code : ''
  },
  code:      (code : string, infostring : string) => infostring.trim() == 'html' ? code : '',
  br:        () => '<br><div class="space"></div>',
  link: (fullKey : string, _i :string, text: string) => {

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
      selectedChapter,

    })}</a>`
  },
})



const encode = (bookText : Book | string) => {
  const book = bookify(bookText)
  const properties = sanitizeProperties(book.index.properties)

  const result = {
    properties: book.index.properties,
    toc: [],
    titles: {},
    chapters: {},
  }


  for(const [chapterIndex, chapter] of book.index.chapters.entries()){

    result.toc.push(key)

    const {text, title } = chapter

    if(title) result.titles[key] = title

    // sanitize and convert
    const t = document.createElement("p")
    t.innerHTML = encodeToHTML(text, renderer(indexedBook, properties)).trim() || ``
    result.chapters[key] = t.innerHTML

  }

  let template = defaultTemplate
  const tIndex = indexedBook.titlePage.indexOf('\n```template')
  if(tIndex > 0){
    const startIndex = tIndex + '\n```template'.length
    const endIndex = indexedBook.titlePage.indexOf('\n```', startIndex)
    template = indexedBook.titlePage.substring(startIndex, endIndex).trim()
  }
  const encodedBook = template.replace('%%MAGEBOOK%%', JSON.stringify(result, null, 2))//`window.magebook = ${JSON.stringify(result, null, 2)}` //.split('\n').map( line  => line.trim()).join('')

  return { encodedBook, mimetype: properties.advancedFormat[0], extension: properties.advancedFormat[1]}
}



export default { encode }


