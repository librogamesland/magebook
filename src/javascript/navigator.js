import { get, writable } from 'svelte/store'
import { getEditor, currentChapterKey, showSidemenu } from './editor.js'
import { newBook, bookIndex, isLoaded } from './new-book.js'
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
    newBook.flush()
  }
  if(updateHistory){
    chapterHistory.push($currentChapterKey)
    historyCanGoBack.set(true)
  }
  editor.gotoLine( $bookIndex.chapters.get(key).contentEnd + 1, Infinity)
  showSidemenu.set(false)
  editor.focus()

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
    if(!e.target.classList.contains('ace_underline')) return false
    const key = e.target.innerHTML.trim()
    if(!key.startsWith('#')) return false
    goToChapter(key.substring(1))

  }

  document.getElementById('main-editor').onclick = onLinkClick
})

export {goToChapter, historyCanGoBack, goBack}