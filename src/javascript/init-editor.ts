import { resolveInitData, isSynced } from './store.js';
import { setupCodemirror, cursorPosition } from './codemirror.js';


import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import Firepad from '@lucafabbian/firepad'
import { get } from 'svelte/store';
import { _ } from 'svelte-i18n';
import { toast } from '@zerodevx/svelte-toast';



const initEditorLocal = (data) => {
  const initialText = data.book
  cursorPosition.set({from: 0, to: 0})
  let [editor] = setupCodemirror(initialText)
  resolveInitData({editor})
}


const initEditorFirebase = (config) => {

  try{
    cursorPosition.set({from: 0, to: 0})
    let [editor, extensions] = setupCodemirror("")


    const app = firebase.initializeApp(config);

    // Get a reference to the database service
    const database = firebase.database(app);

    window['db'] = database



    //// Create Firepad.
    let firepad = Firepad.fromCodeMirror6(database.ref(config.book), editor, {
      defaultText: get(_)('books.fire').replace('%1', config.book),
      recreateWith: extensions,
    });

    firepad.on('ready', function() {
      resolveInitData({editor})
    });

    firepad.on('synced', (newValue) => isSynced.set(newValue ? true : false));

  }catch(e){
    toast.push('Error: ' + e.toString())

    console.log(e)
      // TODO THROW EXCEPTION
  }

}



export { initEditorLocal, initEditorFirebase}