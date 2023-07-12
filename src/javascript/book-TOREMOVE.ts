import {isNatNumber, shuffleArray} from './utils'


interface Chapter {
  key : string,
  title : string,
  group?: string,
  start?: number,
  contentStart?: number,
  contentEnd?: number,
  beforeSpaceLines?: number,
  afterSpaceLines?: number,
  end?: number,
  flags?: string[],
  links?: string[],
} 

interface BookData {
  /** Book full text */
  text: string,
  lines: string[],

  /** Book title */
  title: string,
  /** Text before the first paragraph */
  titlePage: string,
  /** Book properties, set after the title in the form key: value */
  properties: {[key: string]: string},

  /** Chapter key-value dictionary */
  chapter: {[key :string]: Chapter},
  /** List of all chapters */
  chapters: Chapter[],
  /** Every link to a specific chapter. */
  linksToChapter: {[key: string]: string},
  /** Every chapter group, with the chapters that belongs to it */
  groups: {[key: string]: string[]},

}


/* Return version of the key without forbidden chapters */
export const sanitizeKey = (key : string) => key.replace(/[^a-z0-9]/gi,'')




export const generateChapterFullText = ({key, title = '', flags = [], group= '', text = '', beforeSpaceLines = 2, afterSpaceLines= 0} : Chapter) => {
  let r = '\n'.repeat(beforeSpaceLines)
  r += (title) ? `### ${title} {#${key}}` : `### ${key}`
  if(flags && flags.length > 0)  r += "\n" + flags.map( flag => `![][flag-${flag}]`).join(' ')
  if(group) r+= `\n[group]:<> ("${group}")`
  if(text) r+= `\n${text}`

  return r + '\n'.repeat(afterSpaceLines)
}







export const firstAvaiableKey = (bookText : String)  => {
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

  return result.replace(/\[([^\[]*)\](\(\s*#(\w+)\s*\))/g, (...all) => `[${all[1]}](#${
    inverseMap.has(all[3]) ? inverseMap.get(all[3]) : all[3]
  })`) 
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

  toSort.sort()

  return remapBook(indexedBook,  new Map (toSort.map( key => [String(key), String(key)])))
}

