import {EditorView, minimalSetup} from 'codemirror'
import {markdown} from '@codemirror/lang-markdown'
import {classHighlighter} from "@lezer/highlight"
import {syntaxHighlighting } from "@codemirror/language"
import {keymap, highlightActiveLine, ViewUpdate, ViewPlugin} from '@codemirror/view'
import {Decoration} from "@codemirror/view"
import {syntaxTree} from "@codemirror/language"
import {search, searchKeymap} from '@codemirror/search'
import { historyKeymap} from "@codemirror/commands"
import { debounced } from './debounced-store.js'
import { goToChapter } from './navigator.js'


import { book, $bookIndex} from './new-book.js'



export const editorComponentID = 'main-editor'
export const cursorPosition = debounced(10, {from: 0, to: 0})


const workingLink = Decoration.mark({class: "cm-mage-workinglink"})
const brokenLink = Decoration.mark({class: "cm-mage-brokenlink"})
const code = Decoration.mark({class: "cm-mage-code"})
const heading = Decoration.mark({class: "cm-mage-heading"})
const bookTitle = Decoration.mark({class: "cm-mage-booktitle"})
const group = Decoration.mark({class: "cm-mage-group"})
const flag = Decoration.mark({class: "cm-mage-flag"})
const HTMLi = Decoration.mark({class: "cm-mage-HTMLi"})
const HTMLb = Decoration.mark({class: "cm-mage-HTMLb"})
const HTMLu = Decoration.mark({class: "cm-mage-HTMLu"})


const getChapterFromLink = (rawText : string) => rawText.includes('(#') 
    ? rawText.substring(rawText.indexOf('(#') + 2, rawText.lastIndexOf(')')).trim()
    : rawText.substring(rawText.indexOf('[') + 1, rawText.indexOf(']')).trim()


/* Iterate through visible links and mark them as working/broken */
const getLinkDecorations = (view: EditorView) => {
  let decos = []
  for (let {from, to} of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from, to,
      enter: (node) => {
        if(node.name == 'Link'){
          const rawText = view.state.doc.sliceString(node.from, node.to)

          if(rawText === '[group]'){
            decos.push(group.range(node.from, node.to))  
          }else if($bookIndex.properties['disableShortLinks'] == 'true' ){
            if(rawText.includes('(#')){
              const text = getChapterFromLink(rawText)
              const link = $bookIndex.chapters.has(text) ? workingLink : brokenLink
              decos.push(link.range(node.from, node.to))  
            }
          }else{            
            const splitIndex = rawText.indexOf('][')
            if(splitIndex != -1 ){
              const text1 = getChapterFromLink(rawText.substring(0, splitIndex + 1))
              const link1 = $bookIndex.chapters.has(text1) ? workingLink : brokenLink
              decos.push(link1.range(node.from, node.from + splitIndex + 1))  

              const text2 = getChapterFromLink(rawText.substring(splitIndex + 1))
              const link2 = $bookIndex.chapters.has(text2) ? workingLink : brokenLink
              decos.push(link2.range(node.from  + splitIndex + 1, node.to))  

            }else{
              const text = getChapterFromLink(rawText)
              const link = $bookIndex.chapters.has(text) ? workingLink : brokenLink
              decos.push(link.range(node.from, node.to))  
            }
          }
        }else if(node.name == 'ATXHeading1'){
          decos.push(bookTitle.range(node.from, node.to))
        }else if(node.name == 'ATXHeading3'){
          decos.push(heading.range(node.from, node.to))
        }else if(node.name == 'InlineCode' || node.name == 'FencedCode'){
          decos.push(code.range(node.from, node.to))
        }else if(node.name == 'Image'){
          const rawText = view.state.doc.sliceString(node.from, node.to)
          if(rawText.includes('][flag-')){
            decos.push(flag.range(node.from, node.to))
          }
        }else if(node.name == 'HTMLTag'){
          const rawText = view.state.doc.sliceString(node.from, node.to)
          if(rawText == '<i>' || rawText == '</i>'){
            decos.push(HTMLi.range(node.from, node.to))
          }else if(rawText == '<b>' || rawText == '</b>'){
            decos.push(HTMLb.range(node.from, node.to))
          }else if(rawText == '<u>' || rawText == '</u>'){
            decos.push(HTMLu.range(node.from, node.to))
          }
        }
      }
    })
  }
  return  Decoration.set(decos)
}



const magePlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = getLinkDecorations(view)
  }

  update(update: ViewUpdate) {
    cursorPosition.lazySet(update.view.state.selection.main)

    if (update.docChanged || update.viewportChanged){
      book.set(update.view.state.doc.toString())

      this.decorations = getLinkDecorations(update.view)
    }
  }
}, {
  decorations: v => v.decorations,

  eventHandlers: {
    mousedown: (e, view) => {
      let target = e.target as HTMLElement
      if(target.classList.contains('tok-link')) target = target.parentElement
      if(target.classList.contains('cm-mage-workinglink') || target.classList.contains('cm-mage-brokenlink')){
        const text = getChapterFromLink(target.innerText.trim())
        goToChapter(text)

        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }
  }
})

export const setupCodemirror = (text : string) => {
  const extensions =  [
    minimalSetup,
    highlightActiveLine(),
    markdown(),
    search(),
    EditorView.lineWrapping,
    syntaxHighlighting(classHighlighter), 
    EditorView.contentAttributes.of({ spellcheck: 'true' }),

    magePlugin,     

    keymap.of([
      ...searchKeymap,
      { ...historyKeymap[1] , key: 'Mod-Shift-z'}
    ])
  ]


  const editor = new EditorView({
    doc: text,
    parent: document.getElementById(editorComponentID),
    extensions,

  })





  window['editor'] = editor

  window['$bookIndex'] = $bookIndex

  //editor.session.selection.on('changeCursor', () => cursorPosition.lazySet(editor.selection.getCursor()))

  return [editor, extensions]
}