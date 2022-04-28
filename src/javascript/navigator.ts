import { get, writable } from 'svelte/store'
import { getEditor, currentChapterKey, showSidemenu, editorComponentID } from './editor.js'
import { book, bookIndex, isLoaded } from './new-book.js'
import { addChapter, generateChapterText } from './actions.js'

const chapterHistory = []
const historyCanGoBack = writable(false) 

const goToChapter = (key, updateHistory = true) => {
  const editor = getEditor()
  const $bookIndex = get(bookIndex)
  const $currentChapterKey = get(currentChapterKey)

  if(! $bookIndex.chapters.has(key)) {
    addChapter(key, generateChapterText({
      key,
      group: $currentChapterKey ? $bookIndex.chapters.get($currentChapterKey).group : ''
    }))
    book.flush()
  }
  if(updateHistory){
    chapterHistory.push($currentChapterKey)
    historyCanGoBack.set(true)
  }
  editor.gotoLine( $bookIndex.chapters.get(key).contentEnd, Infinity)
  showSidemenu.set(false)
  
  editor.focus()
  editor.scrollToLine($bookIndex.chapters.get(key).contentStart -1, false, true, function () {});

  editor.moveCursorTo( $bookIndex.chapters.get(key).contentEnd, Infinity)

}

const goBack = () => {
  if(chapterHistory.length == 0) return
  if(chapterHistory.length == 1) historyCanGoBack.set(false)

  console.log(chapterHistory.length)
  goToChapter(chapterHistory.pop(), false)
}


isLoaded.subscribe( value => {
  if(!value) return

  const onLinkClick = (e) => {
    if(!e.target.classList.contains('ace_link')) return false
    const key = e.target.innerHTML.trim()
    
    if(key.startsWith('#')){
      goToChapter(key.substring(1))
    }else if(key.startsWith('[') && key.endsWith(']')){
      goToChapter(key.substring(1, key.length - 1).trim())
    }else{
      return false
    }
  }

  document.getElementById(editorComponentID).onclick = onLinkClick
})

export {goToChapter, historyCanGoBack, goBack}