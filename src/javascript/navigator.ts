import { get, writable } from 'svelte/store'
import { store, showSidemenu } from './store'
import { EditorView } from  'codemirror'
import { StateEffect } from "@codemirror/state"
import { generateChapterFullText, getRightOrderKey } from './book-utils';


export const subviewUpdateEffect = StateEffect.define<string>();

const chapterHistory = []
const historyCanGoBack = writable(false)

const goToChapter = async(key, updateHistory = true) => {
  const { book, currentChapterKey, editor } = await store
  const $currentChapterKey = get(currentChapterKey)


  const addChapter = (key, text) => {
    const index = editor.state.doc.line(getRightOrderKey(book, key, $currentChapterKey) + 1).to
    editor.dispatch({
      changes: { from: index, to: index, insert: '\n' + text },
    })
  }

  if(! book.index.chapters.has(key)) {

    addChapter(key, generateChapterFullText({
      key,
      group: $currentChapterKey ? book.index.chapters.get($currentChapterKey).group : ''
    }))
  }
  if(updateHistory){
    chapterHistory.push($currentChapterKey)
    historyCanGoBack.set(true)
  }

  showSidemenu.set(false)



  editor.dispatch({
    selection: {anchor: editor.state.doc.line(
      book.index.chapters.get(key).contentEnd + 1
    ).to},
    effects: [
      subviewUpdateEffect.of("subviewUpdate"),

      EditorView.scrollIntoView(
        editor.state.doc.line(
          book.index.chapters.get(key).contentStart + 1
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