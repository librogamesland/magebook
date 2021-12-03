import Dexie from 'dexie'
import queryString from 'query-string'

import { get, derived } from 'svelte/store'
import { _ } from 'svelte-i18n'

import { randomString } from './utils.js'
import {lockStore} from '../components/Dialogs.svelte'
import {newBook, bookIndex, isLoaded} from './new-book.js'
import {cursorPosition, initEditor} from './editor.js'



const parsedHash = queryString.parse(location.hash);



// Database: declare tables, IDs and indexes
const db = new Dexie('magebook2');
db.version(1).stores({
  sessions: '&id, time, preview'
});


// Session previews
const previews = async() => (await db.sessions.orderBy('preview').keys()).reverse().map( key => ({
      time: new Date(Number(key.substr(0, 30))),
      id: key.substr(31, 20),
      name: key.substr(52, 30)
    }))


// Session class
const session = new (function(){
  // Generate unique identifier for this session
  let data
  const IDLength = 20 
  const lock = randomString(IDLength)

  // Session hash preview
  const preview = (sessionData)  => {
    const name = (sessionData.data.title || 'no title').padEnd(30, '').substr(0, 30)
    return `${String(sessionData.time).padStart(30, '0')}-${sessionData.id}-${name}`
  }

  // Session cleaner
  const maxSessions = 50
  const cleanOldSessions = async() => {
    const key = 'time'
    const times = (await db.sessions.orderBy(key).keys()).reverse()
    if(times.length > maxSessions){
      const lastTime = times[maxSessions]
      await db.sessions.where("time").below(lastTime).modify(function() {
          delete this.value;
      });
    }
  }

  // Session loader
  let sessionName
  const load = async() => {
    if(sessionName){
      console.error("Session loaded twice!")
      return
    }
    // Trova il nome della sessione o creane una nuova
    const lastSession = localStorage.getItem('mage-session-last')

    sessionName = await (async() => {
      const prefix = 'msession='
      if(!lastSession) return randomString(IDLength)

      if(window.location.hash && window.location.hash.includes(prefix)){
        const pos = window.location.hash.indexOf(prefix) + prefix.length
        if(!((pos + IDLength) > window.location.hash.length)){
          const candidate = window.location.hash.substr(pos, IDLength)
          if(candidate == lastSession) return candidate
          try {
            if(await db.sessions.get(candidate)){
              return candidate
            }
          }catch(e){}
        }
      }
      return lastSession ||  randomString(IDLength)
    })()
    location.replace(`#msession=${sessionName}`) // Set dell'url
    
    // Listen url change
    window.addEventListener('hashchange', () => {
      if(!window.location.hash.includes(`#msession=${sessionName}`)){
        window.location.reload()
      }
    }, false);

    // Acquire lock
    localStorage.setItem('mage-session-last', sessionName)
    localStorage.setItem(`mage-lock-${sessionName}`, lock)

    // Load book in session
    let info
    if(lastSession == sessionName){
      info = JSON.parse(localStorage.getItem('mage-session-last-data'))
    }else {
      try{
        info =  (await db.sessions.get(sessionName)) 
      }catch(e){}
    }
    info = info || {
      data:{book: get(_)('books.local'), cursor: {row: 0, column: 0}} 
    }
     
    initEditor(info.data)

    data = derived(
      [newBook, cursorPosition, bookIndex],
      ([$newBook, $cursorPosition, $bookIndex]) => ({
        book: $newBook,
        cursor: $cursorPosition,
        title: $bookIndex.properties.title
      })
    )

    // Save book on changes
    data.subscribe( async(bookData) => {
      if(localStorage.getItem(`mage-lock-${sessionName}`) != lock ){
        lockStore.set( {
          lock: true,
          session: this,
        })
        return 
      }

      localStorage.setItem('mage-session-last', sessionName)
      const sessionData = {
        id: sessionName,
        data: bookData,
        time: new Date().getTime(),
      }
      localStorage.setItem('mage-session-last-data', JSON.stringify(sessionData))

      try{
      await db.sessions.put({
        preview: preview(sessionData),
        ...sessionData
      })
      }catch(e){console.log(e)}
    })
    
    window.onbeforeunload = (e) => {
      newBook.flush()
      delete e['returnValue'];

    }
    setInterval( () => newBook.flush(), 10000)

    cleanOldSessions()
  }

  const open = async(params) => {
    window.onbeforeunload = () => {}

    const id = randomString(IDLength)
    localStorage.setItem('mage-session-last', id)

    const sessionData = {
      id,
      file:{name: "New"},
      time: new Date().getTime(),
      ...params,
    }
    localStorage.setItem('mage-session-last-data', JSON.stringify(sessionData))
    try {
      await db.sessions.put(sessionData)
    }catch(e){}
    location.replace(`#msession=${sessionData.id}`)
  }

  this.duplicate = async(params) => {
    
    open({
      data: get(data),
      ...params,
    })
  }

  this.lock = () => {
    localStorage.setItem(`mage-lock-${sessionName}`, lock)
    lockStore.set({ lock: false })
    book.refresh()
  }


  // Session exports
  Object.assign(this, {sessionName, load, open})
})()

export { db, session, previews}