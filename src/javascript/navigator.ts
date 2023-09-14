import { get, writable } from 'svelte/store'
import { store, showSidemenu } from './store'
import { EditorView } from  'codemirror'
import { StateEffect } from "@codemirror/state"
import { addChapter } from './book-utils';


export const subviewUpdateEffect = StateEffect.define<string>();

// we are going to memorize both the chapter index and the chapter key
const chapterHistory : [number, string][] = []
export const historyCanGoBack = writable(false)


export const focusOnChapter = async(chapterIndex : number) => {
  const { book, editor } = await store
  editor.dispatch({
    selection: {anchor: editor.state.doc.line(
      book.index.chapters[chapterIndex].lines.textEnd + 1
    ).to},
    effects: [
      subviewUpdateEffect.of("subviewUpdate"),

      EditorView.scrollIntoView(
        editor.state.doc.line(
          book.index.chapters[chapterIndex].lines.textStart + 1
        ).to,
        { y: 'start', yMargin: 20, }
      )
    ]
  })

  editor.focus()
}


export const goToChapter = async(chapterIndex : number, updateHistory = true) => {
  const { selectedChapterIndex, selectedChapter } = await store
  const $selectedChapterIndex = get(selectedChapterIndex)
  const $selectedChapter = get(selectedChapter)

  if(updateHistory && $selectedChapterIndex !== -1){
    chapterHistory.push([$selectedChapterIndex, $selectedChapter.key])
    historyCanGoBack.set(true)
  }
  showSidemenu.set(false)
  await focusOnChapter(chapterIndex)
}

export const goToKey = async(key : string, updateHistory = true) => {
  const { book, selectedChapterIndex, selectedChapter, editor } = await store
  const $selectedChapterIndex = get(selectedChapterIndex)
  const $selectedChapter = get(selectedChapter)

  let chapterIndex = book.index.keys[key]
    ?? addChapter(book, {
      key,
      group: $selectedChapter.group
    }, $selectedChapterIndex)[0]


  if(updateHistory && $selectedChapterIndex !== -1){
    chapterHistory.push([$selectedChapterIndex, $selectedChapter.key])
    historyCanGoBack.set(true)
  }

  showSidemenu.set(false)

  focusOnChapter(chapterIndex)
}

export const goBack = async() => {
  if(chapterHistory.length == 0) return
  if(chapterHistory.length == 1) historyCanGoBack.set(false)

  const {book} = await store
  // @ts-ignore
  const [chapterIndex, chapterKey] = chapterHistory.pop()
  /* we are not keeping the record of how keys changed.
  The current policy checks if the chapter with the given index
  has still the same key, otherwise goes to the chapter with the given key. */
  if(book.index.chapters[chapterIndex].key === chapterKey){
    goToChapter(chapterIndex, false)
    return
  }
  goToKey(chapterKey, false)
}


