import { writable, derived, get } from 'svelte/store';
import { debounced } from './debounced-store.js'
import { book, bookIndex, isLoaded, $bookIndex} from './new-book.js'
import { _ } from 'svelte-i18n'
import { setupCodemirror, cursorPosition, subviewChapter, allowedRange } from './codemirror.js';
import { subviewUpdateEffect} from './navigator'
import { s} from './settings'

import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import Firepad from '@lucafabbian/firepad'



let editor = null
let firepad = null


export const showSidemenu = writable(false)
export const isSynced = debounced(500, null)
export const initError = writable("")

  



let lastUpdate = null

const currentChapterKey = derived(
  [cursorPosition, bookIndex, s.singleChapterMode],
  ([$cursorPosition, $bookIndex, $singleChapterMode]) => {


    const [$currentChapterKey, $chapter] = (() => {
      // Last valid position in the document
      const lastPos = editor?.state.doc.toString().length
      let cursorRow = editor?.state.doc.lineAt(Math.min($cursorPosition.from, Math.max(0, lastPos - 1))).number - 1
      let lastWorkingKey = ''
      let lastWorkingChapter = null
      for(const [key, chapter] of $bookIndex.chapters.entries()) {
        if(chapter.contentStart <= cursorRow){
          lastWorkingKey = key
          lastWorkingChapter = chapter
        } else {
          return [lastWorkingKey, lastWorkingChapter]
        }
      }
      return [lastWorkingKey, lastWorkingChapter]
    })()

    console.log("currentchapterkey ", $currentChapterKey)

    ;(() => {
      if(editor == null) return;

      if(String($singleChapterMode) !== "2"){
        allowedRange.set([0, Infinity])
        const newUpdate = []
        if(JSON.stringify(lastUpdate) !== JSON.stringify(newUpdate)){

          setTimeout( () => {
            lastUpdate = newUpdate
            subviewChapter.set(newUpdate)
            editor?.dispatch({ 
              effects: subviewUpdateEffect.of("subviewUpdate")
            })        
          })
        }
        return
      }      
      if($chapter === null){
        let startLine = (get(book) || "").split('\n').size
        try{
          startLine = [...$bookIndex.chapters.entries()][0][1].start
        }catch(e){}

        try{
          console.log(startLine)
          let line =  editor.state.doc.line(startLine)
          allowedRange.set([0, line.to])
          const newUpdate = [[line.to, editor.state.doc.toString().length + 10000]]
          if(JSON.stringify(lastUpdate) !== JSON.stringify(newUpdate)){

            setTimeout( () => {
              lastUpdate = newUpdate
              subviewChapter.set(newUpdate)
              editor?.dispatch({ 
                effects: subviewUpdateEffect.of("subviewUpdate")
              })        
            })
          }
        }catch(e){}

        
        return;
      }
      try {
        let line =  editor.state.doc.line($chapter.contentStart + 2)
        let end = editor.state.doc.line($chapter.end + 1)
  
        allowedRange.set([line.from, end.to])
      
        const newUpdate = [[0, line.from], [end.to +1, editor.state.doc.toString().length + 1000]]
        console.log(lastUpdate, newUpdate)
        if(JSON.stringify(lastUpdate) !== JSON.stringify(newUpdate)){
          lastUpdate = newUpdate
          setTimeout( () => {
            subviewChapter.set(newUpdate)
            editor?.dispatch({ 
              effects: subviewUpdateEffect.of("subviewUpdate")
            })        
          })
        }
      }catch(e){ }  
    })()

    return $currentChapterKey
  } 
)




const currentChapterFullTitle = derived(
  [currentChapterKey, bookIndex],
  ([$currentChapterKey, $bookIndex]) => {
    if($currentChapterKey == '') return ' '
    const chapter = $bookIndex.chapters.get($currentChapterKey)
    return $currentChapterKey + (chapter.title ? ' - ' + chapter.title : '')
  }
)




const initEditorLocal = (data) => {
  book.set(data.book)
  cursorPosition.set({from: 0, to: 0})
  ;[editor] = setupCodemirror(data.book)

  isLoaded.set(true)
}


const initEditorFirebase = (config) => {

  try{
    cursorPosition.set({from: 0, to: 0})

    let extensions = []

    ;[editor, extensions] = setupCodemirror("")


    const app = firebase.initializeApp(config);

    // Get a reference to the database service
    const database = firebase.database(app);

    window['db'] = database



    //// Create Firepad.
    firepad = Firepad.fromCodeMirror6(database.ref(config.book), editor, {
      defaultText: get(_)('books.fire').replace('%1', config.book),
      recreateWith: extensions,
    });

    firepad.on('ready', function() {
      isLoaded.set(true)
    });

    firepad.on('synced', function(newValue) {
      if(newValue){
        isSynced.set(true)
      }else{
        isSynced.lazySet(false)
      }
    });
    
  }catch(e){
    initError.set(e.toString())
  }

}



const getEditor = () => editor 


export {bookIndex, initEditorLocal, initEditorFirebase, getEditor, cursorPosition, currentChapterKey, currentChapterFullTitle }
