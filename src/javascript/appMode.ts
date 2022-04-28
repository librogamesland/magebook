import { writable, derived, get } from "svelte/store"
import { book, bookIndex } from "./new-book.js"
import { parsedHash } from "./database.js"
import { initEditorLocal, cursorPosition } from './editor.js'
import { _ } from 'svelte-i18n'

import md   from './formats/md.js'
import xlgc from './formats/xlgc.js'



// APP MODE
export const isApp    = writable(false)
export const appPath     = writable('')
export const recentFiles = writable(null)

if (parsedHash.app){
  isApp.set(true)
  window.loadRecents().then (result => recentFiles.set(JSON.parse(result)))

  appPath.set(parsedHash.path || '')
}


export const loadAppMode = async() => {

  const path = get(appPath)
  const recents = get(recentFiles)
  
  const data = {
    book: await window.readFile(path),
    cursor: {row: 0, column: 0},
  }
  

  if(data.book == '%ERROR%%') {
    appReload()
    return
  }

  if(data.book == ''){
     data.book = get(_)('books.local')
  }else if (path.endsWith('.xlgc')){
    await       window.writeFile(path.substring(0, path.length - 5) + `-backup-${Math.floor(new Date()/1000)}.xlgc`,data.book)
    data.book = xlgc.decode(data.book)
  }


  try{
    const {cursor} = JSON.parse(recents[encodeURIComponent(path)].Data)
    data.cursor.row = cursor.row || 0
    data.cursor.column = cursor.column || 0
  }catch(e){console.log(e)}

  initEditorLocal(data)

  book.subscribe( $book => {
    if(get(appPath).endsWith('.xlgc')){
      window.writeFile(get(appPath), xlgc.encode(md.decode($book)))
    }else{
      window.writeFile(get(appPath), $book)
    }
  })

  const recentFileData = derived( 
    [bookIndex, cursorPosition],
    ([$bookIndex, $cursorPosition]) => ({title: $bookIndex.properties.title, cursor: $cursorPosition})
  )

  recentFileData.subscribe( value => window.saveRecent(encodeURIComponent(get(appPath)), JSON.stringify(value)))


}

export const appReload = async () =>{

  await window.releaseLock()
  window.location.hash = 'app=true'
  location.reload()
}