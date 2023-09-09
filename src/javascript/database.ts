import Dexie from 'dexie'
import { decode } from 'js-base64';

import { get, derived, writable } from 'svelte/store'
import { _ } from 'svelte-i18n'

import { urlParams, urlParam } from './urls'
import { randomString } from './utils.js'
import {lockStore} from '../components/Dialogs.svelte'
import {store } from './store'
import {initEditorLocal, initEditorFirebase} from './init-editor.js'
import { cursorPosition } from './codemirror.js';

export const firebaseSessionsKey = 'mage-firebase-lastsessions'



// Database: declare tables, IDs and indexes
const db = new Dexie('magebook2');
db.version(1).stores({
  sessions: '&id, time, preview',
  fireSessions: '&id, time, preview'
});

export const isFirebase = writable(false)




// Session previews
const previews = async() => (await db['sessions'].orderBy('preview').keys()).reverse().map( key => ({
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
    const times = (await db['sessions'].orderBy(key).keys()).reverse()
    if(times.length > maxSessions){
      const lastTime = times[maxSessions]
      await db['sessions'].where("time").below(lastTime).modify(function() {
          delete this.value;
      });
    }
  }

  // Session loader
  let loadedSession = false
  const load = async() => {


    if(urlParams.get('fsession')){
      isFirebase.set(true)
      const fsession = urlParam('fsession')
      fsession.change( () => location.reload() )

      initEditorFirebase(JSON.parse(decode(decodeURIComponent(fsession.value))))
      store.then( ({book}) =>{
          const sessions = JSON.parse(localStorage[firebaseSessionsKey] || '{}')
          sessions[fsession.value] = {
            name: book.index.properties.title,
            time: new Date().getTime()
          }
          localStorage[firebaseSessionsKey] = JSON.stringify(sessions)
        })
      return
    }


    // this is to prevent hmr from reloading the session
    if(loadedSession) {
      console.error("Session loaded twice!")
      return
    }
    loadedSession = true

    // find the session name or make a new one
    const lastSession = localStorage.getItem('mage-session-last')
    const msession = urlParam('msession')

    console.log(msession.value)


    msession.set(await (async() => {
      if(!lastSession) return randomString(IDLength)

      if(msession.value){
        if(msession.value == lastSession) return msession.value
        try {
          if(await db['sessions'].get(msession.value)) return msession.value
        }catch(e){}

      }
      return lastSession ||  randomString(IDLength)
    })())

    msession.change( () => window.location.reload() )

    // Acquire lock
    localStorage.setItem('mage-session-last', msession.value)
    localStorage.setItem(`mage-lock-${msession.value}`, lock)

    console.log("somethinggg")
    // Load book in session
    let info
    if(lastSession == msession.value){
      info = JSON.parse(localStorage.getItem('mage-session-last-data'))

    }else {
      try{
        console.log('session', msession.value)
        info =  await db['sessions'].get(msession.value)
        console.log(info)
      }catch(e){console.error(e)}
    }
    info = info ?? {
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
        if(localStorage.getItem(`mage-lock-${msession.value}`) != lock ){
          lockStore.set( {
            lock: true,
            session: this,
          })
          return
        }

        localStorage.setItem('mage-session-last', msession.value)
        const sessionData = {
          id: msession.value,
          data: bookData,
          time: new Date().getTime(),
        }
        localStorage.setItem('mage-session-last-data', JSON.stringify(sessionData))

        try{
        await db['sessions'].put({
          preview: preview(sessionData),
          ...sessionData
        })
        }catch(e){console.log(e)}
      })

      window.onbeforeunload = (e : Event) => {
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
      await db['sessions'].put(sessionData)
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
    const msession = urlParam('msession')
    localStorage.setItem(`mage-lock-${msession.value}`, lock)
    lockStore.set({ lock: false, session: null })
  }


  // Session exports
  Object.assign(this, {load, open})
})()

export { db, session, previews}