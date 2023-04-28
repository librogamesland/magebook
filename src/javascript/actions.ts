import { get } from 'svelte/store'
import { getEditor, currentChapterKey } from "./editor.js";
import { book, bookIndex } from "./new-book.js";


const firstAvaiableKey = ()  => {
  const $bookIndex = get(bookIndex)
  for(let i = 1; i < 10000; i++){
    if(!$bookIndex.chapters.has(String(i))) return String(i)
  }

  return 10000
}


const generateChapterText = ({spacelines = 2, key, title = '', group = '', flags = [], content}) => {
  let r = '\n'.repeat(spacelines)
  r += (title) ? `### ${title} {#${key}}` : `### ${key}`
  if(flags && flags.length> 0)  r += "\n" + flags.map( flag => `![][flag-${flag}]`).join('\n')
  if(group) r+= `\n[group]:<> ("${group}")`
  if(content) r+= `\n${content}`

  return r
}


const isNatNumber = (n) => (n > 0 || String(n) === "0") && Math.floor(n) === +n

const getRightOrderKey = (key) => {
  const $currentChapterKey = get(currentChapterKey)
  const $bookIndex = get(bookIndex)

  if(!isNatNumber(key)) return $bookIndex.chapters.get(String($currentChapterKey)).contentEnd

  const n =  Math.floor(key)
  for(let i = n; i >= 0; i--){
    if($bookIndex.chapters.has(String(i))) return $bookIndex.chapters.get(String(i)).contentEnd
  }

  for(let i = n; i < 10000; i++){
    if($bookIndex.chapters.has(String(i))) return $bookIndex.chapters.get(String(i)).start - 1
  }
  return $bookIndex.chapters.get(String($currentChapterKey))
}


const addChapter = (key, text) => {
  book.flush()

  const index = getEditor().state.doc.line(getRightOrderKey(key) + 1).to
  getEditor().dispatch({
    changes: { from: index, to: index, insert: '\n' + text },
  })

  book.flush()
}


export { firstAvaiableKey, generateChapterText, addChapter, getRightOrderKey}
