import { writable, derived, get } from 'svelte/store';
import { debounced } from './debounced-store.js'
import { newBook, bookIndex, isLoaded} from './new-book.js'
import { _ } from 'svelte-i18n'


export const editorComponentID = 'main-editor'


let editor = null
let firepad = null


export const showSidemenu = writable(false)


function absorbEvent_(event) {
  var e = event || window.event;
  e.stopPropagation && e.stopPropagation();
  e.cancelBubble = true;
}

function preventClickPropagation(node) {
    node.ontouchstart = absorbEvent_;
    node.ontouchmove = absorbEvent_;
    node.ontouchend = absorbEvent_;
    node.ontouchcancel = absorbEvent_;
}


const cursorPosition = debounced(10, {row: 0, column: 0})

const currentChapterKey = derived(
  [cursorPosition, bookIndex],
  ([$cursorPosition, $bookIndex]) => {
    let cursorRow = $cursorPosition.row
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

const setupAce = () => {
  editor = ace.edit(editorComponentID);
  window.editor = editor
  editor.setTheme("ace/theme/chrome");
  editor.session.setMode("ace/mode/markdown");
  editor.session.setUseWorker(false);
  
  editor.setOptions({
    showPrintMargin: false,
    wrap: true,
    fontSize: 16,
    showGutter: window.innerWidth > 430,
    scrollPastEnd: 0.7,
  })
  
  editor.session.selection.on('changeCursor', () => cursorPosition.lazySet(editor.selection.getCursor()))
  
  editor.container.style.lineHeight = 1.4
 
  const findF = editor.commands.commands.find.exec

  editor.commands.addCommand({
    bindKey: {win: 'Ctrl-F', mac: 'Command-F'},
    description: "Find",
    exec: (...e) => {
      findF(...e)
      setTimeout(() => preventClickPropagation(document.querySelector('.ace_search')), 400)
    },
    name: "find",
    readOnly: true
  })

  delete editor.keyBinding.$defaultHandler.commandKeyBinding['ctrl-k']
  delete editor.keyBinding.$defaultHandler.commandKeyBinding['ctrl-l']
  
  editor.renderer.updateFontSize()
  editor.session.on('change', function() {
    newBook.lazySet(editor.getValue())
  });

}


const initEditorLocal = (data) => {
  setupAce()

  editor.getSession().setValue(data.book);
  editor.moveCursorTo(data.cursor.row,data.cursor.column);

  isLoaded.set(true)
}


const initEditorFirebase = (config) => {
  setupAce()


  const app = firebase.initializeApp(config);

  // Get a reference to the database service
  const database = firebase.database(app);

  window.db = database



  //// Create Firepad.
  firepad = window.Firepad.fromACE(database.ref(config.book), editor, {
    defaultText: get(_)('books.fire').replace('%1', config.book)
  });

  isLoaded.set(true)

}



const getEditor = () => editor 


export {bookIndex, initEditorLocal, initEditorFirebase, getEditor, cursorPosition, currentChapterKey, currentChapterFullTitle }
