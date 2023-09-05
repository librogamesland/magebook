import Dexie from 'dexie'
import queryString from 'query-string'
import { decode } from 'js-base64';


import { get, derived, writable } from 'svelte/store'
import { _ } from 'svelte-i18n'

import { randomString } from './utils.js'
import {lockStore} from '../components/Dialogs.svelte'
import {store } from './store'
import {initEditorLocal, initEditorFirebase} from './init-editor.js'
import { cursorPosition } from './codemirror.js';



export const parsedHash = queryString.parse(location.hash);

export const firebaseSessionsKey = 'mage-firebase-lastsessions'



// Database: declare tables, IDs and indexes
const db = new Dexie('magebook2');
db.version(1).stores({
  sessions: '&id, time, preview',
  fireSessions: '&id, time, preview'
});

export const isFirebase = writable(false)




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

    if(parsedHash.fsession){
      isFirebase.set(true)
      window.addEventListener('hashchange', () => {
        window.location.reload()
      }, false);
  
      initEditorFirebase(JSON.parse(decode(decodeURIComponent(parsedHash.fsession))))
      store.then( ({book}) =>{
          const sessions = JSON.parse(localStorage[firebaseSessionsKey] || '{}')
          sessions[parsedHash.fsession as string] = {
            name: book.index.properties.title,
            time: new Date().getTime()
          } 
          localStorage[firebaseSessionsKey] = JSON.stringify(sessions)
        })
      return
    }


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

    parsedHash.msession = sessionName
    location.replace('#' + queryString.stringify(parsedHash)) // Set dell'url
    
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
     
    initEditorLocal(info.data)



    // Save book on changes
    store.then( ({book}) => {
      data = derived(
        [book, cursorPosition],
        ([$book, $cursorPosition]) => ({
          book: $book.text,
          cursor: $cursorPosition,
          title: $book.index.properties.title
        })
      )
    
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
      //  book.flush()
        delete e['returnValue'];

      }
      //setInterval( () => book.flush(), 10000)

      cleanOldSessions()
    })
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
    location.assign(`#msession=${sessionData.id}`)
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
  }


  // Session exports
  Object.assign(this, {sessionName, load, open})
})()

export { db, session, previews}