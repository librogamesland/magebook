import { writable, derived } from 'svelte/store';
import { debounced } from './debounced-store.js'

const loaded = writable(false)


const newBook = debounced(100, '') 



const decode = (file) => {
  let result = {
    properties: {},
    chapters: new Map(),
    linksToChapter: new Map(),
    groups: new Set(),
  }

  let key = ''
  let chapter


  file.split('\n').forEach( (oLine, zeroIndexlineNumber) => { 
    const i = zeroIndexlineNumber  // We keep zero indexed as reference
    const line = oLine.trim()
  
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
      if(key !== '') result.chapters.set(key, chapter)
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
        start: i,
        end: i,
        flags: [],
        links: new Set(),
      }
      return
    }

    if(line !== '') chapter.end = i
  
    if(line.includes('![flag-')){
      ;['final', 'fixed', 'death'].forEach( (flag) => {
        if(line.includes(`![flag-${flag}]`)) chapter.flags.push(flag)
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

  if(key !== '') result.chapters.set(key, chapter)

  console.log(result.linksToChapter)
  //result.key = String(result.properties['last_edited'] || Object.keys(result.chapters)[0]).trim()
  return result
}

const $bookIndex = {}

const bookIndex = derived(
	newBook,
	$book => (Object.assign($bookIndex, decode($book)), $bookIndex)
);





export {loaded, newBook, bookIndex, $bookIndex}
