import { writable, derived } from 'svelte/store';
import { debounced } from './debounced-store.js'

const isLoaded = writable(false)


const newBook = debounced(100, '')

export const sanitizeKey = key => key.replace(/[^a-z0-9]/gi,'')


const decode = (file) => {
  let result = {
    properties: {},
    chapters: new Map(),
    linksToChapter: new Map(),
    groups: new Set(),
  }

  let key = ''
  let chapter

  let lastLineHadContent = false
  let lastContentLinePlusOne = 1

  const lines = file.split('\n')
  lines.forEach( (oLine, zeroIndexlineNumber) => { 
    const i = zeroIndexlineNumber  // We keep zero indexed as reference
    const line = oLine.trim()

    if(lastLineHadContent) lastContentLinePlusOne = i 
    lastLineHadContent = (line !== '')
  
    // Parsing dell'header
    if(key === '' && !line.startsWith('### ')) {
      if(line.startsWith('# ')) {
        result.properties['title'] = line.replace(/\#/g, '').trim()
        return
      }
      const semicolon = line.indexOf(':')
      if(semicolon !== -1){
        result.properties[line.substr(0, semicolon)] = line.substr(semicolon + 1)
      }
      return
    }
  
    // Parsing del testo
    if(line.startsWith('### ')){
      if(key !== ''){
        chapter.contentEnd = lastContentLinePlusOne - 1
        chapter.end = i - 1
        result.chapters.set(key, chapter)
      }
      // crea nuova entità
      key = line.substr(4).trim()
      let title = ''
      const index = key.indexOf('{#')
      if(index != -1){
        title = key.substr(0, index - 1).trim()
        key = key.substr(index + 2,  key.lastIndexOf('}') - 2 - index).trim()
      }
      chapter = {
        title,
        group: '',
        start: lastContentLinePlusOne,
        contentStart: i,
        contentEnd: i,
        end: i,
        flags: [],
        links: new Set(),
      }
      return
    }
  
    if(line.includes('![flag-') || line.includes('![][flag-')){
      ;['final', 'fixed', 'death'].forEach( (flag) => {
        if(line.includes(`![flag-${flag}]`) || line.includes(`![][flag-${flag}]`)) chapter.flags.push(flag)
      })
      return
    }
    const groupIndex = line.indexOf('[group]:<> ("')
    if(groupIndex != -1){
      chapter.group = line.substr(groupIndex + 13, line.lastIndexOf('")') - groupIndex - 13)
      result.groups.add(chapter.group)
      return
    }


    let myRegexp = new RegExp(`\\[([^\\[]*)\\]\\(\\s*\\#([^\\)]+)\\s*\\)`, "g");

    let match = myRegexp.exec(oLine);
    while (match != null) {
      const linkTarget = match[2].trim()
      chapter.links.add(linkTarget)
      if(!result.linksToChapter.has(linkTarget)) result.linksToChapter.set(linkTarget, new Set())
      result.linksToChapter.get(linkTarget).add(key)
      match = myRegexp.exec(oLine);
    }

  })

  if(key !== ''){
    chapter.end = lines.length - 1
    chapter.contentEnd = lastLineHadContent ? chapter.end : lastContentLinePlusOne - 1
    result.chapters.set(key, chapter)
  }

  return result
}

const $bookIndex = {}

const bookIndex = derived(
	newBook,
	$book => (Object.assign($bookIndex, decode($book)), $bookIndex)
);



const shuffle = (selectedFlags = [], groupsFilter = [], increaseRevision = false) => {
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
  if(increaseRevision){
    let revision = Number(newData.properties.revision || "0")
    newData.properties.revision = String(revision + 1)
  }
  newData.key = getShuffledKey(data.key)

  Object.keys(data.chapters).forEach( (oldKey) => {
    const newKey = toNotShuffle.includes(oldKey) ? oldKey : shuffledRev[oldKey]
    newData.chapters[oldKey] = JSON.parse(JSON.stringify(data.chapters[newKey]))
    newData.chapters[oldKey].text =  newData.chapters[oldKey].text
      .replace(/\[([^\[]*)\](\(\s*#(\w+)\s*\))/g, (...all) => `[${all[1]}](#${getShuffledKey(all[3])})`) 

  })

  return newData
}


export {isLoaded, newBook, bookIndex, $bookIndex}
