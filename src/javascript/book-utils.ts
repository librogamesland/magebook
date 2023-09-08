
import {isNatNumber, shuffleArray} from './utils'


// GENERIC UTILITIES

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



// INDEX FUNCTION

type BookIndex = {
  title: string;
  properties: {
    [property: string]: string;
  };
  chapters: {
    key: string;
    title: string;
    group: string;
    flags: string[];
    start: number;
    textStart: number;
    textEnd: number;
    end: number;
    links: string[];
    linkedFrom: number[];
  }[];
  keys: {
    [key: string]: number;
  };
  chaptersWith: {
    key: {
      [key: string]: number[];
    };
    group: {
      [group: string]: number[];
    };
    flag: {
      [flag: string]: number[];
    };
  }

};

export const newIndex = (bookText : string) => {
  const index : BookIndex = {
    title: '',
    properties: {},
    chapters: [],
    keys: {},
    chaptersWith: {
      key: {},
      group: {},
      flag: {},
    }
  }


  let key :string = null
  let chapter : typeof index.chapters[0]

  let lastLineHadContent = false
  let lastContentLinePlusOne = 1

  const lines = bookText.split('\n')
  lines.forEach( (originalLine, i) => {

    const line = originalLine.trim()
    if(lastLineHadContent) lastContentLinePlusOne = i
    lastLineHadContent = (line !== '')

    // header parsing
    if(key === null && !line.startsWith('### ')) {
      if(line.startsWith('# ')) { // title
        index.title = line.replaceAll('#', '').trim()
        return
      }
      // properties
      const semicolon = line.indexOf(':')
      if(semicolon !== -1){
        index.properties[line.substring(0, semicolon).trim()] = line.substring(semicolon + 1).trim()
      }
      return
    }

    // chapters parsing
    if(line.startsWith('### ')){
      if(key !== null){
        chapter.textEnd = lastContentLinePlusOne - 1
        chapter.end = i - 1

        if(chapter.group){
          if(!index.chaptersWith.group[chapter.group]) index.chaptersWith.group[chapter.group] = []
          index.chaptersWith.group[chapter.group].push(index.chapters.length)
        }

        index.chapters.push(chapter)
      }
      // crea nuova entità
      key = line.substring(4).trim()
      let title = ''
      const indexOfKey = key.indexOf('{#')
      if(indexOfKey != -1){
        title = key.substring(0, indexOfKey - 1).trim()
        key = key.substring(indexOfKey + 2,  key.lastIndexOf('}')).trim()
      }
      chapter = {
        key,
        title,
        group: '',
        flags: [],
        start: lastContentLinePlusOne,
        textStart: i,
        textEnd: i,
        end: i,
        links: [], // keys of chapter a user could go from this one
        linkedFrom: [], // index of chapters who are referring the key of this one
      }


      if(!index.chaptersWith.key[key]) index.chaptersWith.key[key] = []
      index.chaptersWith.key[key].push(index.chapters.length)

      return
    }
    let flagStarts = [ '![flag-', '![][flag-' ]
    if(flagStarts.some( flagStart => line.includes(flagStart))){

      for(const flagStart of flagStarts){
        let i = 0;
        while((i = line.indexOf(flagStart, i)) != -1){
          i += flagStart.length
          const endBracket = line.indexOf(']', i)
          if(endBracket == -1) break
          const flag = line.substring(i, endBracket).trim()
          if(!chapter.flags.includes(flag)) chapter.flags.push(flag)
        }
      }
      return
    }
    const groupIndex = line.indexOf('[group]:<> ("')
    if(groupIndex != -1){
      chapter.group = line.substring(groupIndex + '[group]:<> ("'.length, line.lastIndexOf('")'))
      return
    }


    // short links
    let myRegexp = new RegExp(`\\[([^\\[]*)\\]\\(\\s*\\#([^\\)]+)\\s*\\)`, "g");
    let match = myRegexp.exec(originalLine);
    while (match != null) {
      const linkTarget = match[2].trim()
      if(!chapter.links.includes(linkTarget)) chapter.links.push(linkTarget)
      match = myRegexp.exec(originalLine);
    }
    if(index.properties['disableShortLinks'] === 'true') return

    // long links
    let shortRegexp = new RegExp(`\\[([^\\[]*)\\](?!\\()`, "g");
    match = shortRegexp.exec(originalLine);
    while (match != null) {
      const linkTarget = match[1].trim()
      if(!chapter.links.includes(linkTarget)) chapter.links.push(linkTarget)
      match = shortRegexp.exec(originalLine);
    }

  })

  if(key !== null){
    chapter.end = lines.length - 1
    chapter.textEnd = lastLineHadContent ? chapter.end : lastContentLinePlusOne - 1

    if(chapter.group){
      if(!index.chaptersWith.group[chapter.group]) index.chaptersWith.group[chapter.group] = []
      index.chaptersWith.group[chapter.group].push(index.chapters.length)
    }

    index.chapters.push(chapter)
  }


  for(const key of Object.keys(index.chaptersWith.key)){
    index.keys[key] = index.chaptersWith.key[key][0]
  }

  for (const [i, chapter] of index.chapters.entries()) {
    for (const link of chapter.links) {
      for(const chapterIndex of index.chaptersWith.key[link] ?? []){
        index.chapters[chapterIndex].linkedFrom.push(i)
      }
    }
  }

  return index


}

window['newIndex'] = newIndex

export const indexBook = (bookText : string) => {
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

    let flagStarts = [ '![flag-', '![][flag-' ]
    if(flagStarts.some( flagStart => line.includes(flagStart))){

      for(const flagStart of flagStarts){
        let i = 0;
        while((i = line.indexOf(flagStart, i)) != -1){
          i += flagStart.length
          const endBracket = line.indexOf(']', i)
          if(endBracket == -1) break
          const flag = line.substring(i, endBracket).trim()
          chapter.flags.push(flag)
        }
      }
      return
    }
    const groupIndex = line.indexOf('[group]:<> ("')
    if(groupIndex != -1){
      chapter.group = line.substring(groupIndex + 13, line.lastIndexOf('")'))
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



export const extractIndexedBook = (bookText: string) => {

  const result = {
    properties: {},
    chapters: new Map(),
    linksToChapter: new Map(),
    groups: new Set(),
    titlePage: '',

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


// BOOK OBJECT/CLASS

interface Book {
  text: string
  index: ReturnType<typeof indexBook>,
}

interface EditableBook extends Book {
  set: (newText: string) => void
  replace: (from: number, to: number, newText: string) => void
  apply: (transformation: (book: this) => void) => void
}


export const bookHeadless = (initialText = '') => new class implements EditableBook {
  #cachedIndex = null
  #cachedExtractedIndex = null
  #text = initialText
  steps : Array<QueueStep> = []

  set(newText : string){
      this.steps.push({type: 's', newText})
      this.#text = newText
      this.#cachedIndex = null
  }

  get text() { return this.#text}
  get index() {
    if(this.#cachedIndex === null) this.#cachedIndex = indexBook(this.#text)
    return this.#cachedIndex
  }

  get extractedIndex() {
    if(this.#cachedExtractedIndex === null) this.#cachedExtractedIndex = extractIndexedBook(this.#text)
    return this.#cachedExtractedIndex
  }

  replace(from : number, to : number, newText: string){
    this.steps.push({type: 'r', from, to, newText})
    this.#text = this.#text.substring(0, from) + newText + this.#text.substring(to, this.#text.length)
    this.#cachedIndex = null
    this.#cachedExtractedIndex = null
  }


  apply(transformation : (book : this) => void ){
    transformation(this)
  }
}


export const bookify = (bookOrText : Book | string) : Book => {
  if(typeof bookOrText !== 'string') return bookOrText
  return bookHeadless(bookOrText)
}


// UTILIES FOR BOOK OBJECT

export const firstAvaiableKey = (bookOrText : Book | string)  => {
  const book = bookify(bookOrText)
  const chapters = book.index.chapters

  for(let i = 1; i < 10000; i++){
    if(!chapters.has(String(i))) return String(i)
  }

  return String(10000)
}


export const getRightOrderKey = (bookOrText : Book | string, key, $currentChapterKey) => {
  const book = bookify(bookOrText)
  const $bookIndex = book.index

  if(!isNatNumber(key)){
    const currentChapter = $bookIndex.chapters.get(String($currentChapterKey))
    return currentChapter ? currentChapter.contentEnd : book.text.split('\n').length - 1
  }

  const n =  Math.floor(key)
  for(let i = n; i >= 0; i--){
    if($bookIndex.chapters.has(String(i))) return $bookIndex.chapters.get(String(i)).contentEnd
  }

  for(let i = n; i < 10000; i++){
    if($bookIndex.chapters.has(String(i))) return $bookIndex.chapters.get(String(i)).start - 1
  }
  return $bookIndex.chapters.get(String($currentChapterKey))
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


type QueueStep = { type: string, newText: string, from?: number, to?: number }

