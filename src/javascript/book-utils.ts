
import {isNatNumber, shuffleArray} from './utils'

/* Return version of the key without forbidden chapters */
export const sanitizeKey = (key : string) => key.replace(/[^a-z0-9]/gi,'')




export const generateChapterFullText = ({key, title = '', flags = [], group= '', text = '', beforeSpaceLines = 2, afterSpaceLines= 0}) => {
  let r = '\n'.repeat(beforeSpaceLines)
  r += (title) ? `### ${title} {#${key}}` : `### ${key}`
  if(flags && flags.length > 0)  r += "\n" + flags.map( flag => `![][flag-${flag}]`).join(' ')
  if(group) r+= `\n[group]:<> ("${group}")`
  if(text) r+= `\n${text}`

  return r + '\n'.repeat(afterSpaceLines)
}



export const indexBook = (bookText) => {
  const result = {
    properties: {},
    chapters: new Map(),
    linksToChapter: new Map(),
    groups: new Set(),
  }

  let key = ''
  let chapter

  let lastLineHadContent = false
  let lastContentLinePlusOne = 1

  const lines = bookText.split('\n')
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
        result.properties[line.substr(0, semicolon).trim()] = line.substr(semicolon + 1).trim()
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

    if(result.properties && result.properties['disableShortLinks'] === 'true') return

    let shortRegexp = new RegExp(`\\[([^\\[]*)\\](?!\\()`, "g");

    match = shortRegexp.exec(oLine);
    while (match != null) {
      const linkTarget = match[1].trim()
      chapter.links.add(linkTarget)
      if(!result.linksToChapter.has(linkTarget)) result.linksToChapter.set(linkTarget, new Set())
      result.linksToChapter.get(linkTarget).add(key)
      match = shortRegexp.exec(oLine);
    }

  })

  if(key !== ''){
    chapter.end = lines.length - 1
    chapter.contentEnd = lastLineHadContent ? chapter.end : lastContentLinePlusOne - 1
    result.chapters.set(key, chapter)
  }

  return result
}



export const extractIndexedBook = (bookText) => {

  const result = {
    properties: {},
    chapters: new Map(),
    linksToChapter: new Map(),
    groups: new Set(),

    ...indexBook(bookText)
  }

  const lines = bookText.split('\n')


  // Add titlePage text, the one before chapters
  result.titlePage = lines.slice(0, result.chapters.size > 0 ? result.chapters.values().next().value.contentStart : lines.length - 1).join('\n')

  // Add text of every chapter
  for(const [key, {contentStart, contentEnd}] of result.chapters){
    const text = lines.slice(contentStart + 1,contentEnd +1).filter( line => {
      const trimmedLine = line.trim()
      return !(trimmedLine.startsWith('###') || trimmedLine.includes('[group]:') || trimmedLine.includes('![][flag-') || trimmedLine.includes('![flag-'))
    }).join('\n')

    const fullText = lines.slice(contentStart,contentEnd +1).join('\n')

    Object.assign(result.chapters.get(key), {text, fullText})
  }

  return result
}




export const firstAvaiableKey = (bookText)  => {
  const chapters = extractIndexedBook(bookText).chapters

  for(let i = 1; i < 10000; i++){
    if(!chapters.has(String(i))) return String(i)
  }

  return String(10000)
}


export const remapBook = (indexedBook, chapterMap : Map<string, string>) => {
  // Create an object mapping old chapters' keys to new keys
  const inverseMap = new Map<string, string>()
  for(const [key, val] of chapterMap) inverseMap.set(val, key) 

  // Array of new keys
  const mapKeys = [...chapterMap.keys()]


  let result = indexedBook.titlePage
  let insertingKeyAtIndex = 0
  for(const [key, oldChapter] of indexedBook.chapters){

    // If this chapter has been remapped, insert a new key here
    let newKey = inverseMap.has(key) ? mapKeys[insertingKeyAtIndex++] : key

    // If key has been remapped, pick the remapped, otherwise keep the old one
    const {title, flags, group, text} = inverseMap.has(key) ? indexedBook.chapters.get(chapterMap.get(newKey)): oldChapter

    result += generateChapterFullText({
      key: newKey,
      title,
      flags,
      group,
      text,
      beforeSpaceLines: 1,
      afterSpaceLines: 2
    })
  }

  let text = result.replace(/\[([^\[]*)\](\(\s*#(\w+)\s*\))/g, (...all) => `[${all[1]}](#${
    inverseMap.has(all[3]) ? inverseMap.get(all[3]) : all[3]
  })`)

  if(!indexedBook.properties['disableShortLinks']) text = text.replace(/\[([^\[]*)\]/g, (...all) => `[${
    inverseMap.has(all[1]) ? inverseMap.get(all[1]) : all[1]
  }]`) 

  return text
}

export const shuffleBook = (bookText, {selectedFlags = [], groupsFilter = [], onlyNumbers = true} = {}) => {
  const indexedBook = extractIndexedBook(bookText)
  const toShuffle = []

  /* Find key that should be shuffled */
  for (const [key, {group, flags}] of indexedBook.chapters){
    // Skip key if is not numeric and onlyNumbers = true
    if(onlyNumbers && !isNatNumber(key)) continue; 

    // Skip key if groupsFilter and group is not whitelisted
    if(groupsFilter.length > 0 && !groupsFilter.includes(group)) continue;

    // Skip key if chapter has a flag in selectedFlags
    if(flags.some(flag => selectedFlags.includes(flag))) continue;

    toShuffle.push(key)
  }

  // Shuffle keys
  const shuffledKeys = JSON.parse(JSON.stringify(toShuffle));  // Obj copy
  shuffleArray(shuffledKeys);

  return remapBook(indexedBook, new Map (toShuffle.map( (key, i) => [String(key), String(shuffledKeys[i])])))
}


export const compactBook = (bookText) => {
  const indexedBook = extractIndexedBook(bookText)
  const toCompact = []
  const numbers   = []

  let i = 0
  for(const [key,] of indexedBook.chapters){
    if(isNatNumber(key)){
      toCompact.push(key)
      numbers.push(++i)
    }
  }

  return remapBook(indexedBook,  new Map (toCompact.map( (key, i) => [String(numbers[i]), String(key)])))
}



export const sortBook = (bookText) => {
  const indexedBook = extractIndexedBook(bookText)
  const toSort = []

  for (const [key,] of indexedBook.chapters){
    if(isNatNumber(key)) toSort.push(Number(key))
  }

  toSort.sort( (a, b) => Number(a) - Number(b))

  return remapBook(indexedBook,  new Map (toSort.map( key => [String(key), String(key)])))
}