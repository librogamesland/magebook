
import { get } from 'svelte/store';
import {isNatNumber, shuffleArray} from './utils'
import { defaultBookProperties } from './plugin-interface';


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
  properties: Record<string, string>;
  chapters: BookChapter[];
  keys: { [key: string]: number; };
  chaptersWith: {
    key:   { [key  : string]: number[]; };
    group: { [group: string]: number[]; };
    flag:  { [flag : string]: number[]; };
  }

};

export const indexBook = (bookText : string, defaultProperties : Record<string, string>| null = null) => {
  const lines = bookText.split('\n')

  const index : BookIndex = {
    title: '',
    lines: {
      titlePageEnd: -1,
      end: lines.length - 1,
    },
    lineStarts: [0],
    properties: {...(defaultProperties ?? get(defaultBookProperties))},
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
    chapter!.lines.end = lines.length - 1
    chapter!.lines.textEnd = lastLineHadContent ? chapter!.lines.end : lastContentLinePlusOne - 1

    if(chapter!.group){
      if(!index.chaptersWith.group[chapter!.group]) index.chaptersWith.group[chapter!.group] = []
      index.chaptersWith.group[chapter!.group].push(index.chapters.length)
    }

    index.chapters.push(chapter!)
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

export interface EditableBook extends Book {
  set: (newText: string) => void
  replace: (from: number, to: number, newText: string) => void
  apply: (transformation: (book: this) => void) => void
}

/** Main implementation of an EditableBook. Uses a string as a store. */
export const stringBook = (initialText = '') => new class implements EditableBook {
  #cachedIndex : BookIndex | undefined = undefined
  #cachedContent : BookContent | undefined = undefined
  #text = initialText
  steps : Array<QueueStep> = []

  set(newText : string){
      this.steps.push({type: 's', newText})
      this.#text = newText
      this.#cachedIndex = undefined
      this.#cachedContent = undefined
  }

  get text() { return this.#text}
  get index() {
    if(this.#cachedIndex === undefined) this.#cachedIndex = indexBook(this.#text)
    return this.#cachedIndex!
  }

  get content() {
    if(this.#cachedContent === undefined) this.#cachedContent = contentBook(this.#text, this.#cachedIndex)
    return this.#cachedContent
  }

  replace(from : number, to : number, newText: string){
    this.steps.push({type: 'r', from, to, newText})
    this.#text = this.#text.substring(0, from) + newText + this.#text.substring(to, this.#text.length)
    this.#cachedIndex = undefined
    this.#cachedContent = undefined
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
}, $selectedChapterIndex : number = -1) : [number, string] =>{
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
  return [chapterIndex, text ]
}

export const deleteChapter = (book: EditableBook, chapterIndex : number) => {
  const { start, end, textStart, textEnd } = book.index.chapters[chapterIndex].lines
  const {lineStarts} = book.index
  if(chapterIndex === 0 && book.index.chapters.length > 1){
    console.log("www", textStart, end)
    const from = lineStarts[textStart] - 1
    const to = lineStarts[end + 1] - 1
    book.replace(from, to, '' )
    return
  }

  const from = lineStarts[start] - 1
  const to = lineStarts[textEnd + 1] - 1
  book.replace(from, to, '' )
}

export const editChapter = (book: EditableBook, chapterIndex : number, {
  key = '',
  title = '',
  flags = [],
  group = '',
  content = '',
}, $selectedChapterIndex : number = -1) => {
  const chapter = book.index.chapters[chapterIndex]
  content = book.content.chapters[chapterIndex].content
  if(key == chapter.key &&
    title == chapter.title &&
    group == chapter.group &&
    flags.length === chapter.flags.length &&
    flags.every( (flag, i) => flag === chapter.flags[i]) ){
      return
  }

  const {textStart, textEnd} = chapter.lines

  if(group == chapter.group &&
    flags.length === chapter.flags.length &&
    flags.every( (flag, i) => flag === chapter.flags[i]) ){
      book.replace(book.index.lineStarts[textStart], book.index.lineStarts[textStart + 1] - 1, chapterHeading(key, title))
  }else{
    book.replace(book.index.lineStarts[textStart], book.index.lineStarts[textEnd + 1] - 1,
      chapterText({
        key, title, flags, group,
        content: book.content.chapters[chapterIndex].content,
        beforeSpaceLines:0, afterSpaceLines: 0
      }))
  }

  if(key !== chapter.key){
    book.set(remapLinks(book.text, {[chapter.key] : key}))
  }


}


export const chapterHeading = (key: string, title: string = '') : string => {
  if(title === '') return `### ${key}`
  return `### ${title} {#${key}}`
}


export const remapLinks = (text : string, inverseKeyMap : Record<string, string>, disableShortLinks = false) => {

  text = text.replace(/\[([^\[]*)\](\(\s*#(\w+)\s*\))/g, (...all) => `[${all[1]}](#${
    (all[3] in inverseKeyMap) ? inverseKeyMap[all[3]] : all[3]
  })`)

  if(!disableShortLinks) text = text.replace(/\[([^\[]*)\]/g, (...all) => `[${
    (all[1] in inverseKeyMap) ? inverseKeyMap[all[1]] : all[1]
  }]`)

  return text
}


/**
 *
 * @param bookOrText
 * @param map Pair of numbers, where to remap each chapterIndex
 * @returns
 */
export const remapMoveChapters = (bookOrText : Book | string, map : Record<number, number>) : string=> {
  const book = bookify(bookOrText)

  const reverseMap : Record<number, number> = {}
  const inverseKeyMap : Record<string, string> = {}
  for(const [from, to] of Object.entries(map)) {
    const fromInt = parseInt(from)
    reverseMap[to] = fromInt
    inverseKeyMap[book.index.chapters[fromInt].key] = book.index.chapters[to].key
  }

  const newChaptersText = []
  for (const [chapterIndex, [chapter, {text}]] of chaptersOf(book).entries()){
    if(chapterIndex in reverseMap){
      const newText = book.content.chapters[reverseMap[chapterIndex]].text
      const endOfFirstLine = newText.indexOf('\n')
      newChaptersText.push(
        chapterHeading(chapter.key, chapter.title) + ((endOfFirstLine === -1) ? '' : newText.substring(endOfFirstLine))
      )
    }else{
      newChaptersText.push(text)
    }
  }

  return book.content.titlePage + '\n' + remapLinks(newChaptersText.join('\n\n'), inverseKeyMap)
}


export type ChapterFilter = {
  selectedFlags?: string[],
  groupsFilter?: string[],
  onlyNumbers?: boolean
}

const filteredChapterIndexes = (book : Book, {selectedFlags = [], groupsFilter = [], onlyNumbers = true} : ChapterFilter) => {
  const indexes: number[] = []

  for (const [chapterIndex, {key, group, flags}] of book.index.chapters.entries()){
    // Skip key if is not numeric and onlyNumbers = true
    if(onlyNumbers && !isNatNumber(key)) continue;

    // Skip key if groupsFilter and group is not whitelisted
    if(groupsFilter.length > 0 && !groupsFilter.includes(group)) continue;

    // Skip key if chapter has a flag in selectedFlags
    if(flags.some(flag => selectedFlags.includes(flag))) continue;

    indexes.push(chapterIndex)
  }

  return indexes

}


export const shuffleBook = (bookOrText : Book | string, filter : ChapterFilter = {}) : string => {
  const book = bookify(bookOrText)
  const toShuffle = filteredChapterIndexes(book, filter)

  // Shuffle keys
  const shuffledKeys = JSON.parse(JSON.stringify(toShuffle));  // Obj copy
  shuffleArray(shuffledKeys);

  const shuffleMap: Record<number, number> = {}
  for (const [index, from] of toShuffle.entries()) shuffleMap[from] = shuffledKeys[index]

  return remapMoveChapters(book, shuffleMap)
}

/** ChapterFilter option "onlyNumbers" is, of course, always overwritten to true */
export const compactBook = (bookOrText : Book | string, filter : ChapterFilter = {}) => {
  const book = bookify(bookOrText)
  filter = {...filter, onlyNumbers: true}
  const toCompact = filteredChapterIndexes(book, filter).sort(
    (aI, bI) => parseInt(book.index.chapters[aI].key) - parseInt(book.index.chapters[bI].key)
  )

  const toCompactKeys = toCompact.map( chapterIndex => parseInt(book.index.chapters[chapterIndex].key))
  const busyKeys = Object.keys(book.index.keys).filter( key => toCompactKeys.includes(key as unknown as number)).map( key => parseInt(key))

  const inverseKeyMap : Record<string, string> = {}
  let newText = book.text
  let i = 1
  for(const chapterIndex of toCompact){
    while(busyKeys.includes(i)){
      i+= 1
    }
    const newKey = String(i)
    const {key, title, lines: {textStart}} = book.index.chapters[chapterIndex]
    inverseKeyMap[key] = newKey

    const start = book.index.lineStarts[textStart]
    const end   = book.index.lineStarts[textStart + 1] - 1

    newText = newText.substring(0, start) + chapterHeading(newKey, title) + newText.substring(end)
    i += 1
  }

  return book.content.titlePage + remapLinks(newText.substring(book.content.titlePage.length), inverseKeyMap)
}


export const sortBook = (bookOrText : Book | string, filter : ChapterFilter = {}) : string => {
  const book = bookify(bookOrText)
  filter = {...filter, onlyNumbers: true}
  const sortedIndexes = filteredChapterIndexes(book, filter)
    .sort((aI, bI) => parseInt(book.index.chapters[aI].key) - parseInt(book.index.chapters[bI].key))

  const newChaptersText = []
  let remappingUntil = 0
  for (const [chapterIndex, [chapter, {text}]] of chaptersOf(book).entries()){
    if(sortedIndexes.includes(chapterIndex)){
      newChaptersText.push(book.content.chapters[sortedIndexes[remappingUntil]].text)
      remappingUntil += 1
    }else{
      newChaptersText.push(text)
    }
  }

  return book.content.titlePage + '\n' + newChaptersText.join('\n\n')
}

type QueueStep = { type: string, newText: string, from?: number, to?: number }

