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

if (window.Neutralino){
  isApp.set(true)
  window.Neutralino.init();
  Neutralino.storage.getData('recentFiles').then( files => {
    recentFiles.set(JSON.parse(files || '{}'))
  }).catch( e => {
    if(e.code == 'NE_ST_NOSTKEX'){
      Neutralino.storage.setData('recentFiles', '{}')
    }
  })
}


export const loadAppMode = async() => {

  const path = get(appPath)
  const recents = get(recentFiles)

  console.log('path', path)

  let data;

  try{
  await window.Neutralino.filesystem.appendFile(path, '')
  
  data = {
    book: await window.Neutralino.filesystem.readFile(path),
    cursor: {row: 0, column: 0},
  }
  

  }catch(e){
    appReload()
    return
  }

  if(data.book == ''){
     data.book = get(_)('books.local')
  }else if (path.endsWith('.xlgc')){
    await       window.Neutralino.filesystem.writeFile(path.substring(0, path.length - 5) + `-backup-${Math.floor(new Date()/1000)}.xlgc`,data.book)
    data.book = xlgc.decode(data.book)
  }


  try{
    const {cursor} = JSON.parse(recents[path])
    data.cursor.row = cursor.row || 0
    data.cursor.column = cursor.column || 0
  }catch(e){console.log(e)}

  initEditorLocal(data)

  book.subscribe( $book => {
    if(get(appPath).endsWith('.xlgc')){
      window.Neutralino.filesystem.writeFile(get(appPath), xlgc.encode(md.decode($book)))
    }else{
      window.Neutralino.filesystem.writeFile(get(appPath), $book)
    }
  })

  const recentFileData = derived( 
    [bookIndex, cursorPosition],
    ([$bookIndex, $cursorPosition]) => ({title: $bookIndex.properties.title, cursor: $cursorPosition, timestamp: Date.now()})
  )

  let timerId;

  const throttleFunction  = async (func, delay) => {
    if (timerId) return
    timerId  =  setTimeout( async() => {
      await Promise.resolve(func())
      timerId  =  undefined;
    }, delay)
  }
  

  recentFileData.subscribe( value => {
    throttleFunction(async()=> {
      console.log('resolving2', await Neutralino.storage.getData('recentFiles'))

      const files = JSON.parse((await Neutralino.storage.getData('recentFiles'))  || '{}')
      files[get(appPath)] = value
      await Neutralino.storage.setData('recentFiles', JSON.stringify(files))
      recentFiles.set(files)
    }, 300)
  })


}

export const appReload = async () =>{

  await window.releaseLock()
  window.location.hash = 'app=true'
  location.reload()
}


export const externalLink = (e) => {
  if(get(isApp)){

    const to = e.target.getAttribute('href')
    Neutralino.os.open(to)
    e.preventDefault()
    return true
  }
}