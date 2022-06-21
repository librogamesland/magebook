import { writable, derived, get } from 'svelte/store';
import { debounced } from './debounced-store.js'
import { book, bookIndex, isLoaded, $bookIndex} from './new-book.js'
import { _ } from 'svelte-i18n'
import { setupCodemirror, cursorPosition } from './codemirror.js';


import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import Firepad from '@lucafabbian/firepad'



let editor = null
let firepad = null


export const showSidemenu = writable(false)
export const isSynced = debounced(500, null)
export const initError = writable("")

  




const currentChapterKey = derived(
  [cursorPosition, bookIndex],
  ([$cursorPosition, $bookIndex]) => {
    // Last valid position in the document
    const lastPos = editor?.state.doc.toString().length
    let cursorRow = editor?.state.doc.lineAt(Math.min($cursorPosition.from, Math.max(0, lastPos - 1))).number - 1
    let lastWorkingKey = ''
    for(const [key, chapter] of $bookIndex.chapters.entries()) {
      if(chapter.contentStart <= cursorRow){
        lastWorkingKey = key
      } else {
        return lastWorkingKey
      }
    }
    return lastWorkingKey
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
  editor = setupCodemirror(data.book)

  isLoaded.set(true)
}


const initEditorFirebase = (config) => {

  try{
    cursorPosition.set({from: 0, to: 0})

    editor = setupCodemirror("")


    const app = firebase.initializeApp(config);

    // Get a reference to the database service
    const database = firebase.database(app);

    window['db'] = database



    //// Create Firepad.
    firepad = Firepad.fromCodeMirror6(database.ref(config.book), editor, {
      defaultText: get(_)('books.fire').replace('%1', config.book)

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
