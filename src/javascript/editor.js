import { writable, derived } from 'svelte/store';
import { debounced } from './debounced-store.js'
import { newBook, bookIndex, $bookIndex} from './new-book.js'

let editor = null
let firepad = null


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
      if(chapter.start <= cursorRow){
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

const initEditor = (componentID) => {
  editor = ace.edit(componentID);
  window.editor = editor
  editor.setTheme("ace/theme/chrome");
  editor.session.setMode("ace/mode/markdown");
  editor.session.setUseWorker(false);
  
  editor.setOptions({
    showPrintMargin: false,
    wrap: true,
    fontSize: 16,
    showGutter: window.innerWidth > 430,
  })
  
  editor.session.selection.on('changeCursor', () => cursorPosition.lazySet(editor.selection.getCursor()))
  
  editor.container.style.lineHeight = 1.4
 
  const findF = editor.commands.commands.find.exec

  editor.commands.addCommand({
    bindKey: {win: 'Ctrl-F', mac: 'Command-F'},
    description: "Find",
    exec: (...e) => {
      findF(...e)
      setTimeout(() => preventClickPropagation(document.querySelector('.ace_search')), 200)
    },
    name: "find",
    readOnly: true
  })
  
  editor.renderer.updateFontSize()
    //// Initialize Firebase.
    //// TODO: replace with your Firebase project configuration.
    var config = {
      apiKey: "AIzaSyAfP5gcmH8wtXGCzPFqBWYcwNxG31JXSas",
      authDomain: "magebook.firebaseapp.com",
      databaseURL: "https://magebook-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "magebook",
      storageBucket: "magebook.appspot.com",
      messagingSenderId: "827898413639",
      appId: "1:827898413639:web:cc786d0d158890d8d7a762",
      measurementId: "G-FZQ13Y7R84"
    };
    const app = firebase.initializeApp(config);
  
    // Get a reference to the database service
    const database = firebase.database(app);

    editor.session.on('change', function(delta) {
        newBook.lazySet(editor.getValue())
    });
  
  
    //// Create Firepad.
    firepad = window.Firepad.fromACE(database.ref(), editor, {
      defaultText: '// JavaScript Editing with Firepad!\nfunction go() {\n  var message = "Hello, world.";\n  console.log(message);\n}'
    });
}


const firstAvaibleKey = ()  => {
  for(let i = 1; i < 10000; i++){
    if(!$bookIndex.chapters.has(String(i))) return String(i)
  }

  return 10000
}


const goToChapter = (key) => {
  console.log(firstAvaibleKey())
  editor.gotoLine( $bookIndex.chapters.get(key).end + 1, Infinity)
  editor.focus()
}

const getEditor = () => editor 


export {initEditor, getEditor, cursorPosition, currentChapterKey, currentChapterFullTitle, goToChapter }
