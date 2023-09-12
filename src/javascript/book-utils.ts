
import {isNatNumber, shuffleArray} from './utils'


// GENERIC UTILITIES

/* Return version of the key without forbidden chapters */
export const sanitizeKey = (key : string) => key.replace(/[^a-z0-9]/gi,'')



export const atLinePosition = (text : string, lineNumber : number, end = true) => {

}


// INDEX FUNCTION

export type BookChapter = {
  key: string;
  title: string;
  group: string;
  flags: string[];
  lines: {
    start: number;
    textStart: number;
    textEnd: number;
    end: number;
  }
  links: string[];
  linkedFrom: number[];
}

export type BookIndex = {
  title: string;
  lines: {
    titlePageEnd: number;
    end: number;
  },
  lineStarts: number[];
  properties: {
    [property: string]: string;
  };
  chapters: BookChapter[];
  keys: { [key: string]: number; };
  chaptersWith: {
    key:   { [key  : string]: number[]; };
    group: { [group: string]: number[]; };
    flag:  { [flag : string]: number[]; };
  }

};

export const indexBook = (bookText : string) => {
  const lines = bookText.split('\n')

  const index : BookIndex = {
    title: '',
    lines: {
      titlePageEnd: -1,
      end: lines.length - 1,
    },
    lineStarts: [0],
    properties: {},
    chapters: [],
    keys: {},
    chaptersWith: {
      key: {},
      group: {},
      flag: {},
    }
  }


  let key :string | null = null
  let chapter : typeof index.chapters[0]

  let lastLineHadContent = false
  let lastContentLinePlusOne = 0

  let lineIndex = 0
  lines.forEach( (originalLine, i) => {
    lineIndex += originalLine.length + 1
    index.lineStarts.push(lineIndex)

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

      if(key === null){
        index.lines.titlePageEnd = i - 1
      }
      if(key !== null){
        chapter.lines.textEnd = lastContentLinePlusOne - 1
        chapter.lines.end = i - 1

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
        lines: {
          start: lastContentLinePlusOne,
          textStart: i,
          textEnd: i,
          end: i,
        },
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
          if(!chapter.flags.includes(flag)){
            chapter.flags.push(flag)
            if(index.chaptersWith.flag[flag] == null) index.chaptersWith.flag[flag] = []
            index.chaptersWith.flag[flag].push(index.chapters.length)
          }
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
    chapter.lines.end = lines.length - 1
    chapter.lines.textEnd = lastLineHadContent ? chapter.lines.end : lastContentLinePlusOne - 1

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

  if(index.chapters.length === 0) index.lines.titlePageEnd = index.lines.end

  return index


}

export type BookChapterContent = {
  text: string,
  content: string,
}

export type BookContent = {
  titlePage: string;
  chapters: BookChapterContent[]
}

/*
export const extractContent = (book, chapterIndex) => {
  const chapter = book.index.chapters[chapterIndex]
  const text = book.text.substring()
}*/

export const contentBook = (bookOrText: string , index?: BookIndex) => {
  if(!index) index = indexBook(bookOrText)
  const book = {text: bookOrText, index}
  const lines = book.text.split('\n')

  return {
    titlePage: lines.slice(0, book.index.lines.titlePageEnd + 1).join('\n'),
    chapters: book.index.chapters.map( (chapter, i) => {

      return {
        text: lines.slice(chapter.lines.textStart, chapter.lines.textEnd + 1).join('\n'),
        content: lines.slice(chapter.lines.textStart, chapter.lines.textEnd + 1).filter(line => {
          const trimmedLine = line.trim()
          return !(trimmedLine.startsWith('###') || trimmedLine.includes('[group]:') || trimmedLine.includes('![][flag-') || trimmedLine.includes('![flag-'))
        }).join('\n'),
      }
    })
  }
}


// BOOK OBJECT/CLASS

export interface Book {
  text: string
  index: BookIndex,
  content: BookContent,
}

interface EditableBook extends Book {
  set: (newText: string) => void
  replace: (from: number, to: number, newText: string) => void
  apply: (transformation: (book: this) => void) => void
}

/** Main implementation of an EditableBook. Uses a string as a store. */
export const stringBook = (initialText = '') : EditableBook => new class {
  #cachedIndex = null
  #cachedContent = null
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

  get content() {
    if(this.#cachedContent === null) this.#cachedContent = contentBook(this.#text, this.#cachedIndex)
    return this.#cachedContent
  }

  replace(from : number, to : number, newText: string){
    this.steps.push({type: 'r', from, to, newText})
    this.#text = this.#text.substring(0, from) + newText + this.#text.substring(to, this.#text.length)
    this.#cachedIndex = null
    this.#cachedContent = null
  }


  apply(transformation : (book : this) => void ){
    transformation(this)
  }
}

export const bookify = (bookOrText : Book | string) : Book => {
  if(typeof bookOrText !== 'string') return bookOrText
  return stringBook(bookOrText)
}

export const chaptersOf = (bookOrText : Book | string) : [BookChapter, BookChapterContent][] => {
  const book = bookify(bookOrText)
  return book.index.chapters.map ( (chapter, i) => {
    return [chapter, book.content.chapters[i]]
  })
}



// UTILIES FOR BOOK OBJECT

/**
 * Finds and retrieves the first unused key for a given book or text input.
 * @param bookOrText The input book or text to search for an available key.
 * @returns The first available key as a string.
 */
export const firstAvaiableKey = (bookOrText : Book | string)  => {
  const book = bookify(bookOrText)
  // Iterate over keys to find the right one.
  // Not sure if it's computationally efficient, it looks ok for now.
  let i = 1
  while(true){
    if(book.index.keys[String(i)] === undefined) return String(i)
    i += 1
  }
}



/**
 * Find the best place where to insert a new chapter with the set key.
 * Makes educated guesses on what should be the intended place from a human perspective.
 *
 * @return The chapter index where the new key should be place. chapterIndex == 0 means before any other chapter,
 *  chapterIndex == book.index.chapters.length means after any other chapter.
 */
export const findNewKeyIndex = (bookOrText : Book | string, key : string, $selectedChapterIndex = -1): number => {
  const book = bookify(bookOrText)
  if(!isNatNumber(key)){
    if($selectedChapterIndex === -1) return book.index.chapters.length
    return $selectedChapterIndex + 1
  }

  const n = parseInt(key)
  // Check if there are numerical keys before this one in the neighbourhood.
  const neighbourhood = Math.max(0, n - 1000) // 1000 is a reasonable value
  for(let i = n; i>=neighbourhood; i--){
    const previousKeyIndex = book.index.keys[String(i)]
    if(previousKeyIndex) return previousKeyIndex + 1
  }
  // Otherwise, get all keys that are numerical and search amongst them
  const numericalKeys = Object.keys(book.index.keys).filter( key => isNatNumber(key)).map( key => parseInt(key)).sort((a,b)=> a - b)
  if(numericalKeys.length === 0){  // if no numerical key, just place it at the bottom
    if($selectedChapterIndex === -1) return book.index.chapters.length
    return $selectedChapterIndex + 1
  }
  if(numericalKeys[0] > n){ // if all keys are higher, place it before the lowest key
    const followingKeyIndex = book.index.keys[String(numericalKeys[0])]
    return followingKeyIndex
  }
  // Otherwise, find the maximum key amongst the ones lower than this one
  let maximumPreviousKey = numericalKeys[0]
  for(const key of numericalKeys){
    if(key > n) break;
    maximumPreviousKey = key  // should be changed to a binary search.
  }
  const previousKeyIndex = book.index.keys[String(maximumPreviousKey)]
  return previousKeyIndex + 1
}

export type ChapterData = {
  key : string,
  title?: string,
  flags?: string[],
  group?: string,
  content?: string,
  beforeSpaceLines?: number,
  afterSpaceLines?: number,
}
export const chapterText = ({key, title = '', flags = [], group= '', content = '', beforeSpaceLines = 2, afterSpaceLines= 0} : ChapterData) => {
  let r = '\n'.repeat(beforeSpaceLines)
  r += (title) ? `### ${title} {#${key}}` : `### ${key}`
  if(flags && flags.length > 0)  r += "\n" + flags.map( flag => `![][flag-${flag}]`).join(' ')
  if(group) r+= `\n[group]:<> ("${group}")`
  if(content) r+= `\n${content}`

  return r + '\n'.repeat(afterSpaceLines)
}

export const addChapter = (book: EditableBook, {
  key = null as string | null,
  title = '',
  flags = [],
  group = '',
  content = '',
}, $selectedChapterIndex : number = -1) =>{
  if(key == null) key = firstAvaiableKey(book)
  const chapterIndex = findNewKeyIndex(book, key, $selectedChapterIndex)
  const text = chapterText({
    key, title, flags, group, content,
    beforeSpaceLines : (chapterIndex > 0 ? 2 : 0),
    afterSpaceLines : (chapterIndex > 0 ? 0 : 2),
  })

  const position = chapterIndex === 0
    ? book.index.lineStarts[book.index.lines.titlePageEnd + 1] - 1
    : book.index.lineStarts[book.index.chapters[chapterIndex - 1].lines.textEnd + 1] - 1

  book.replace(position, position, text)
  return chapterIndex
}

export const removeChapter = (book: EditableBook, chapterIndex : number) => {

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

export const shuffleBook = (bookText,
  {selectedFlags = [], groupsFilter = [], onlyNumbers = true}
  : {selectedFlags?: string[], groupsFilter?: string[], onlyNumbers?: boolean}
  = {}) => {
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

