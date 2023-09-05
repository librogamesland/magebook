import { get } from 'svelte/store'
import { store } from './store'
import { initEditorLocal } from './init-editor.js'
import { time, _ } from 'svelte-i18n'

import { EditorView } from "codemirror"
import {undo, redo, historyCallbacks } from "./history"




// APP MODE
export const isVSCode    = window['ISVSCODE']

// @ts-ignore
export const vscode = isVSCode ? acquireVsCodeApi() : null;


export const updateHandlers = []
  
let firstTime = true
let lastDocument = undefined


const update = (message) : void => {

  updateHandlers.forEach(fn => fn(message))

  if(message.text === '' || message.text != null){
    if(firstTime){
      lastDocument = message.text

      initEditorLocal({
        book: message.text,
        cursor: {row: 0, column: 0},
      })

      firstTime = false
      
    }else{
      // Skip update if we have unmerged text.
      if(lastDocument && lastDocument == message.text) return;
      const anchor  = Math.min(get(cursorPosition).to + getEditor().state.doc.length - message.text.length, message.text.length)

      lastDocument = message.text
      getEditor().dispatch({
        selection: {anchor},
        effects: [ EditorView.scrollIntoView(anchor)],
        changes: {from: 0, to: getEditor().state.doc.length, insert: message.text},
      }) 
    }

    vscode.setState({
      text: message.text
    })

  }
}

  

if(isVSCode){


  // signal to vscode that a new state has been added
  let nextShouldBeAdded = true

  historyCallbacks.push( (isDefinitive) => {
    if(isDefinitive) nextShouldBeAdded = true;
    if(nextShouldBeAdded){
        vscode.postMessage({ type: 'addUndo'});
        nextShouldBeAdded = false;
    }
  })

	// Handle messages sent from the extension to the webview
	window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		switch (message.type) {
			case 'update':  
        update(message)
				return;

      case 'undo':
        undo({
          state: getEditor().state,
          dispatch: getEditor().dispatch,
        })
        return;

      case 'redo':
        redo({
          state: getEditor().state,
          dispatch: getEditor().dispatch,
        })
        return;


		}
	});



  

  book.subscribe( $book => {
    if(!firstTime){
      if(lastDocument && $book === lastDocument) return;

      vscode.postMessage({ type: 'updateBook', book: get(book) });
    }
  })



}

export const loadVSSession = () => {
  	// Webviews are normally torn down when not visible and re-created when they become visible again.
	// State lets us save information across these re-loads
	const state = vscode.getState();
	if (false && state) {
    update(state)
	}else {
    vscode.postMessage({ type: 'askUpdate' });
  }


}
