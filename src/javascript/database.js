import Dexie from 'dexie'
import { randomString } from './utils.js'
import {lockStore} from '../components/Dialogs.svelte'



window.lo = lockStore
// Database: declare tables, IDs and indexes
const db = new Dexie('magebook');
db.version(1).stores({
  sessions: '&id, time, preview'
});


// Session previews
const previews = async() => {

  return (await db.sessions.orderBy('preview').keys()).reverse().map( key => ({
      time: new Date(Number(key.substr(0, 30))),
      id: key.substr(31, 20),
      revision: String(Number(key.substr(52, 6))),
      name: key.substr(59, 30)
    }))
}

// Session class
const Session = function(book, defaultBookData){
  // Generate unique identifier for this session
  const IDLength = 20 
  const lock = randomString(IDLength)

  // Session hash preview
  const preview = (sessionData)  => {
    const name = sessionData.file.name.padEnd(30, '').substr(0, 30)
    const revision = String(sessionData.data.properties.revision || "1").trim().padStart(6, '0')
    return `${String(sessionData.time).padStart(30, '0')}-${sessionData.id}-${revision}-${name}`
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
    info = info || {data: defaultBookData, file: {name: defaultBookData.properties.title}} 
     
    const {data} = info
    this.file = info.file
    book.update( () => data)

    // Save book on changes
    book.subscribe( async(bookData) => {
      if(localStorage.getItem(`mage-lock-${sessionName}`) != lock ){
        lockStore.set( {
          lock: true,
          session: this,
        })
        return 
      }

      localStorage.setItem('mage-session-last', sessionName)
      const sessionData = {
        file: this.file,
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
      }catch(e){}
    })
    
    window.onbeforeunload = () => book.refresh()
    setInterval( () => book.refresh(), 10000)

    cleanOldSessions()
  }

  const open = async(params) => {
    window.onbeforeunload = () => {}
    book.refresh()

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
      file: this.file,
      data: book.get(),
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
}

export { db, Session, previews}