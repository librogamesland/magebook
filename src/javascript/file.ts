import md   from './formats/md.js'
import xlgc from './formats/xlgc.js'
import fodt from './formats/fodt.js'
import docx from './formats/docx.js'
import html from './formats/html.js'
import advanced from './formats/advanced.js'

import { extractIndexedBook } from './book-utils.js'
import {disableShortLinks} from './encoder.js'
import {session} from './database.js'



const formats = { md, xlgc, fodt, docx, html, advanced }



// Read file from fileinput
const open = (elem) => {
  // Crea una copia delle info del file
  const file = elem.files[0]
  const name = file.name

  // Usa un fileReader per leggere il file come testo
  const reader = new FileReader()
  reader.onload = async() => {
    const extension = name.substr(name.lastIndexOf('.') + 1)
    if(!['md', 'xlgc'].includes(extension)){
      console.error("Unsupported format")
      return
    }

    const book = reader.result
    const decodedMd = formats[extension].decode(book)
    const encodedBook = await Promise.resolve(decodedMd)


    
    session.open({
      data: {
        book: encodedBook,
        cursor: {row: 0, column: 0},
      }
    })

    elem.value = ''
  }
  reader.readAsText(file)
}


// Download file
const download = async(formatKey, book) => {

  const format = formats[formatKey]
  const indexedBook = extractIndexedBook(book)
 

  disableShortLinks(indexedBook.properties.disableShortLinks && indexedBook.properties.disableShortLinks.trim() == "true")
  const { encodedBook, mimetype, extension } = await Promise.resolve(format.encode(book))

  if(!encodedBook) return

  const element = document.createElement('a')
  element.setAttribute(
    'href',
    `data:${mimetype};charset=utf-8,${encodeURIComponent(encodedBook)}`
  )
  element.setAttribute('download', (indexedBook.properties.title || 'magebook') + '.' + extension)

  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}


export { open, download }