import dateFormat from 'date-format'
import saveAs from 'file-saver'
import { encode } from 'js-base64';


import md   from './formats/md.js'
import xlgc from './formats/xlgc.js'
import fodt from './formats/fodt.js'
import docx from './formats/docx.js'
import html from './formats/html.js'
import advanced from './formats/advanced.js'


import { extractIndexedBook } from './book-utils.js'
import {disableShortLinks} from './encoder.js'
import {session} from './database.js'
import {s} from './settings'

import {get} from 'svelte/store'
import { isVSCode, vscode } from './vscode'



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
  const { encodedBook, mimetype, extension, blob = null } = await Promise.resolve(format.encode(book))


  const suffix = `-${dateFormat.asString(get(s.dateFormat), new Date())}.${extension}`
  const fileName = `${indexedBook.properties.title || 'magebook'}${suffix}`






  if(encodedBook){
    if(isVSCode){
      vscode.postMessage({
        type: 'saveFile',
        suffix,
        data: encodedBook,
      });
      return
    }

    const element = document.createElement('a')
    element.setAttribute(
      'href',
      `data:${mimetype};charset=utf-8,${encodeURIComponent(encodedBook)}`
    )
    element.setAttribute('download', fileName)

    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    return

  }


  if(blob){
    blob.then(blobResult => {
      if(isVSCode){
        let reader = new FileReader();
        reader.onload = function() {
          vscode.postMessage({
            type: 'saveFile',
            suffix,
            blob: reader.result,
          });
        };
        reader.readAsDataURL(blobResult); // converts the blob to base64 and calls onload

        return
      }

      saveAs(blobResult, fileName);
    });
  }
}


export { open, download }