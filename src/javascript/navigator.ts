import { get, writable } from 'svelte/store'
import { getEditor, currentChapterKey, showSidemenu } from './editor.js'
import { book, bookIndex, isLoaded } from './new-book.js'
import { addChapter, generateChapterText } from './actions.js'
import { EditorView } from  'codemirror'
import { StateEffect } from "@codemirror/state"


export const subviewUpdateEffect = StateEffect.define<string>();

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
  
  showSidemenu.set(false)

  

  editor.dispatch({
    selection: {anchor: editor.state.doc.line(
      $bookIndex.chapters.get(key).contentEnd + 1
    ).to},
    effects: [
      subviewUpdateEffect.of("subviewUpdate"),

      EditorView.scrollIntoView(
        editor.state.doc.line(
          $bookIndex.chapters.get(key).contentStart + 1
        ).to,
        { y: 'start', yMargin: 20, } 
      )
    ]
  })




  editor.focus()

}

const goBack = () => {
  if(chapterHistory.length == 0) return
  if(chapterHistory.length == 1) historyCanGoBack.set(false)

  goToChapter(chapterHistory.pop(), false)
}


export {goToChapter, historyCanGoBack, goBack}