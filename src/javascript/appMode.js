import { writable, derived, get } from "svelte/store"
import { newBook, bookIndex } from "./new-book.js"
import { parsedHash } from "./database.js"
import { initEditorLocal, cursorPosition } from './editor.js'


// APP MODE
export const isApp    = writable(false)
export const appPath     = writable('')
export const recentFiles = writable(null)

if (parsedHash.app){
  isApp.set(true)
  window.loadRecents().then (result => recentFiles.set(JSON.parse(result)))
}


export const loadAppMode = async() => {
  
  const data = {
    book: await window.readFile(get(appPath)),
    cursor: {row: 0, column: 0},
  }
  

  initEditorLocal(data)

  newBook.subscribe( $newBook => {
    window.writeFile(get(appPath), $newBook)
  })

  const recentFileData = derived( 
    [bookIndex, cursorPosition],
    ([$bookIndex, $cursorPosition]) => ({title: $bookIndex.properties.title, cursor: $cursorPosition})
  )

  recentFileData.subscribe( value => window.saveRecent(encodeURIComponent(get(appPath)), JSON.stringify(value)))


}

export const appReload = async () =>{
  await window.releaseLock()

  location.reload()
}