import {writable } from 'svelte/store'
import {shuffleArray, isNumber} from './utils.js'


const empty = {
  key: "1",
  properties: {},
  chapters: {
    "1": {title: "", group: "", flags:[], text: ""},
  }
}

// Book constructor
const Book = function(data = empty){
  const beforeCallbacks = []
  const beforeUpdate    = (callback) => beforeCallbacks.push(callback)

  const {set, subscribe} = new writable(data)



  const newChapter = () => ({title: "", group: "", flags:[], text: ""})
  const sanitizeKey = key => key.replace(/[^a-z0-9]/gi,'')

  const update = (callback) => {
    const callbacks = [...beforeCallbacks, callback]
    callbacks.forEach( (fun) => {
      data = {...data, ...fun(data)}
    })
    if(!data.chapters || Object.keys(data.chapters).length == 0){
      data.chapters = { "1": newChapter() }
    }
    if(!(data.chapters[data.key])){
      console.warn("Key not found, rewriting with first key")
      data.key = Object.keys(data.chapters)[0]
    }
    set(data) 
  }



  const availableKey = () => {
    for (let i = 1; i < 5000; i++) {
      const key = String(i)
      if (data.chapters[key]) continue
      return key
    }
  }

  // Something like "01 - Title"
  const fullTitle = (chapterKey) => chapterKey + (data.chapters[chapterKey].title ? ' - ' + data.chapters[chapterKey].title : '')

  const linksTo = (chapterKey) => {
    const escapeRegex = (string) => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const keyRegex =     new RegExp(String.raw`\[([^\[]*)\](\(\s*\#${escapeRegex(chapterKey)}\s*\))`, '')
    return Object.keys(data.chapters).filter( key => keyRegex.test(data.chapters[key].text) )
  }

  const get = () => {
    update(()=> {})
    return JSON.parse(JSON.stringify(data))
  }

  const sortedKeys = (chapters = data.chapters) => Object.keys(chapters).sort( (a, b) => {
    const aIsNumber = isNumber(a)
    const bIsNumber = isNumber(b)

    if(!aIsNumber && bIsNumber) return -1
    if(aIsNumber && !bIsNumber) return +1
    if(!aIsNumber && !bIsNumber) return a.localeCompare(b)
    if(aIsNumber && bIsNumber) return  parseInt(a, 10) - parseInt(b, 10)
  })

  const refresh = () => {}

  const shuffle = (selectedFlags = [], groupsFilter = []) => {
    const toShuffle = []
    const toNotShuffle = []

    // Divide le chiavi in due gruppi, da mescolare e da non mescolare
    Object.entries(data.chapters).forEach( ([key, value]) => {
      if(!isNumber(key)){
        toNotShuffle.push(key)
        return 
      }
      // Se la flag era fra quelle fisse, allora aggiungi la chiave a quella da non mischiare
      if(value.flags && value.flags.some( flag => selectedFlags.includes(flag))){
        toNotShuffle.push(key)
        return
      }
      if(groupsFilter.length > 0){
        if(!(value.group && groupsFilter.includes(value.group) )){
          toNotShuffle.push(key)
          return   
        }
      }
      toShuffle.push(key)
    })
    // Mescola le chiavi e crea un dizionario
    const shuffledKeys = JSON.parse(JSON.stringify(toShuffle));  // Obj copy
    shuffleArray(shuffledKeys);
    const shuffled    = Object.fromEntries( toShuffle.map((k, i) =>[k, shuffledKeys[i]]))
    const shuffledRev = Object.fromEntries( toShuffle.map((k, i) =>[shuffledKeys[i], k]))
    const getShuffledKey = key => (toNotShuffle.includes(key) ? key : shuffled[key]) || key

    shuffleArray(toShuffle)
    const newData = get()
    newData.key = getShuffledKey(data.key)

    Object.keys(data.chapters).forEach( (oldKey) => {
      const newKey = toNotShuffle.includes(oldKey) ? oldKey : shuffledRev[oldKey]
      newData.chapters[oldKey] = JSON.parse(JSON.stringify(data.chapters[newKey]))
      newData.chapters[oldKey].text =  newData.chapters[oldKey].text
        .replace(/\[([^\[]*)\](\(\s*#(\w+)\s*\))/g, (...all) => `[${all[1]}](#${getShuffledKey(all[3])})`) 

    })

    return newData
  }


  Object.defineProperty(this, "data", {
    get : () => get(),
    set: (value) => update( ()=> value)
  });

  // Return
  Object.assign(this, {
    "__is_book": true,
    beforeUpdate,
    update, 
    refresh,
    subscribe,
    get,
    newChapter,
    availableKey,
    sanitizeKey,
    sortedKeys,
    linksTo,
    fullTitle,
    shuffle,
  })
}

export {Book}