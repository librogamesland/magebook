import dateFormat from 'date-format'
import saveAs from 'file-saver'
import { encode } from 'js-base64';


import * as md   from './formats/md.js'
import * as xlgc from './formats/xlgc.js'
import * as fodt from './formats/fodt.js'
import * as docx from './formats/docx.js'
import * as html from './formats/html.js'
import * as json from './formats/json.js'


import { bookify, type Book } from './book-utils.js'
import {disableShortLinks} from './encoder.js'
import {session} from './database.js'
import {s} from './settings'

import {get} from 'svelte/store'
import { isVSCode, vscode } from './vscode'
import { bookFormats } from './plugin-interface';


type FormatModule = {
  mimetype : Readonly<string>,
  extension : Readonly<string>,
  encode? : (book : Book | string) => {
    encodedBook?: string,
    mimetype : string,
    extension : string,
    blob? : any,
  },
  decode? : (text : string) => Promise<string> | string,
}

const defaultFormats : Record<string, FormatModule> = { md, fodt, html, json, docx, xlgc }



// Read file from fileinput
const open = (elem : HTMLInputElement) => {
  if(elem.files === null) return
  // Crea una copia delle info del file
  const file = elem.files[0]
  const name = file.name

  // Usa un fileReader per leggere il file come testo
  const reader = new FileReader()
  reader.onload = async() => {
    const formats = {
      ...defaultFormats,
      ...(get(bookFormats) as Record<string, FormatModule>)
    }
    let extension = name.substring(name.lastIndexOf('.') + 1)
    if(extension == 'magebook') extension = 'md' // treat magebook files as md

    if(formats[extension]  === undefined || formats[extension].decode === undefined){
      console.error("Unsupported format")
      return
    }

    const book = reader.result
    // @ts-ignore
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
const download = async(formatKey : string, bookOrString : Book | string) => {
  const book = bookify(bookOrString)
  const formats = {
    ...defaultFormats,
    ...(get(bookFormats) as Record<string, FormatModule>)
  }
  const format = formats[formatKey]

  if(format === undefined || format.encode === undefined){
    throw "Unsopported format"
  }

  disableShortLinks(book.index.properties?.disableShortLinks?.trim() == "true")
  const { encodedBook, mimetype, extension, blob = null } = await Promise.resolve(format.encode(book))


  const suffix = `-${dateFormat.asString(get(s.dateFormat), new Date())}.${extension}`
  const fileName = `${book.index.title || 'magebook'}${suffix}`






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
    blob.then((blobResult :any) => {
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