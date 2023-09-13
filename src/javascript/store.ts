
import { derived, writable, type Writable } from 'svelte/store'
import { debouncable } from './special-svelte-stores'
import { indexBook, type BookIndex, contentBook, stringBook } from './book-utils'
import { cursorPosition, setOnChangeCallback } from './codemirror'
import type { EditorView } from 'codemirror'


export const showSidemenu = writable(false)
export const showPluginPanel = writable(false)
export const isSynced = debouncable(500, null)






// main interface from writing/reading text from the store
export const bookStoreCodemirror = (editor : EditorView, setOnChangeCallback : any) => {

  let text = '', index : BookIndex = null
  const getState = (newText : string) => {
    text = newText
    index = indexBook(text)

    return Object.freeze({text, index})
  }


  const { subscribe, set } = writable(getState(editor.state.doc.toString()))

  /*
  const millis = 200
  let timer
  const debouncedSet = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      set(getState())
    }, millis);
  }*/

  setOnChangeCallback((newText : string) => {
    const state = getState(newText)
    set(state)
    return state
  })





  return {
    set: (newText : string) => {
      editor.dispatch({
        changes: {from: 0, to: editor.state.doc.length, insert: newText}
      })
    },


    subscribe,

    get text() { return text },
    get index() { return index },
    get content() { return contentBook(text, index) },


    replace(from : number, to : number, newText : string) {
      editor.dispatch({
        changes: {from, to, insert: newText}
      })
    },

    apply(transformation) {
      const book = stringBook(editor.state.doc.toString())
      transformation(book)
      book.steps.forEach(step => {
        switch(step.type) {
          case 's': {
            editor.dispatch({
              changes: {from: 0, to: editor.state.doc.length, insert: step.newText}
            })
            break
          }

          case 'r': {
            editor.dispatch({
              changes: {from: step.from, to: step.to, insert: step.newText}
            })
            break
          }
        }
      })
    }
  }
}







// initialization from outside
let resolveInitDataCallback = null
const initData = new Promise<{editor: EditorView}>( resolve => {
  resolveInitDataCallback = resolve
})

export const resolveInitData = ({editor}) => resolveInitDataCallback({editor})




// the actual data
export const store = (async () => {

  const {editor} = await initData;

  const book = bookStoreCodemirror(editor, setOnChangeCallback)



  const selectedChapterIndex = derived(
    [cursorPosition, book],
    ([$cursorPosition, $book]) => {

      const lastPos = editor.state.doc.toString().length
      let cursorRow = editor.state.doc.lineAt(Math.min($cursorPosition.from, Math.max(0, lastPos - 1))).number - 1
      let lastWorkingIndex : number = -1
      for(const [chapterIndex, chapter] of $book.index.chapters.entries()) {
        if(chapter.lines.textStart <= cursorRow){
          lastWorkingIndex = chapterIndex
        } else {
          return lastWorkingIndex
        }
      }
      return lastWorkingIndex
  });

  const selectedChapter = derived(
    [selectedChapterIndex, book],
    ([$selectedChapterIndex, $book]) => {
      return $book.index.chapters[$selectedChapterIndex]
    }
  )

  const selectedChapterFullTitle = derived(
    [selectedChapterIndex, book],
    ([$selectedChapterIndex, $book]) => {
      if($selectedChapterIndex == -1) return ''
      const chapter = $book.index.chapters[$selectedChapterIndex]
      return chapter.key + (chapter.title ? ' - ' + chapter.title : '')
    }
  )




  return {
    book,
    selectedChapter,
    selectedChapterIndex,
    selectedChapterFullTitle,
    editor
  }


})()

export const nullUntilLoaded : Writable<Awaited<typeof store>> = writable({
  book: null,
  selectedChapter: null,
  selectedChapterIndex: null,
  selectedChapterFullTitle: null,
  editor: null,
})


store.then(s => {
  Object.assign(window, s)
  nullUntilLoaded.set(s)
})
