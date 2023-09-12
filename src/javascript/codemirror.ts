import {EditorView } from 'codemirror'
import {markdown} from '@codemirror/lang-markdown'
import {classHighlighter} from "@lezer/highlight"
import {syntaxHighlighting } from "@codemirror/language"
import {keymap, highlightActiveLine, ViewUpdate, ViewPlugin, highlightSpecialChars, drawSelection,  type DecorationSet} from '@codemirror/view'
import {RangeSetBuilder, StateEffect, StateField, EditorSelection} from "@codemirror/state"
import {Decoration} from "@codemirror/view"
import {syntaxTree} from "@codemirror/language"
import {search, searchKeymap} from '@codemirror/search'
import { defaultKeymap, indentWithTab } from "@codemirror/commands"
import { debouncable } from './debounced-store.js'
import { goToChapter, goToKey } from './navigator.js'

import { history, historyKeymap } from './history'

import { s } from './settings'
import { isVSCode } from './vscode.js'
import { get, writable } from 'svelte/store'
import { indexBook, type Book } from './book-utils.js'



let onChangeCallback = (text: string) => ({text, index: indexBook(text)})
export const setOnChangeCallback = callback => onChangeCallback = callback


export const editorComponentID = 'main-editor'
export const cursorPosition = debouncable(10, {from: 0, to: 0})
export const allowedRange = writable([0, Infinity])


const workingLink = Decoration.mark({class: "cm-mage-workinglink"})
const brokenLink = Decoration.mark({class: "cm-mage-brokenlink"})
const heading = Decoration.mark({class: "cm-mage-heading"})
const bookTitle = Decoration.mark({class: "cm-mage-booktitle"})
const group = Decoration.mark({class: "cm-mage-group"})
const flag = Decoration.mark({class: "cm-mage-flag"})
const HTMLi = Decoration.mark({class: "cm-mage-HTMLi"})
const HTMLb = Decoration.mark({class: "cm-mage-HTMLb"})
const HTMLu = Decoration.mark({class: "cm-mage-HTMLu"})
const property = Decoration.mark({class: "cm-mage-property"})



const getChapterFromLink = (rawText : string) => rawText.includes('(#')
    ? rawText.substring(rawText.indexOf('(#') + 2, rawText.lastIndexOf(')')).trim()
    : rawText.substring(rawText.indexOf('[') + 1, rawText.indexOf(']')).trim()


/* Iterate through visible links and mark them as working/broken */
const getLinkDecorations = (view: EditorView, {text, index} : Book) => {

  const endTitlePage = index.lineStarts[index.lines.titlePageEnd + 1]

  let decos : any[] = []


  for (let {from, to} of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from, to,
      enter: (node) => {
        if(node.name == 'Link'){
          const rawText = view.state.doc.sliceString(node.from, node.to)

          if(rawText === '[group]'){
            decos.push(group.range(node.from, node.to))
          }else if(index.properties['disableShortLinks'] == 'true' ){
            if(rawText.includes('(#')){
              const text = getChapterFromLink(rawText)
              const link = index.keys[text] !== undefined ? workingLink : brokenLink
              decos.push(link.range(node.from, node.to))
            }
          }else{
            const splitIndex = rawText.indexOf('][')
            if(splitIndex != -1 ){
              const text1 = getChapterFromLink(rawText.substring(0, splitIndex + 1))
              const link1 = index.keys[text1] !== undefined ? workingLink : brokenLink
              decos.push(link1.range(node.from, node.from + splitIndex + 1))

              const text2 = getChapterFromLink(rawText.substring(splitIndex + 1))
              const link2 = index.keys[text2] !== undefined ? workingLink : brokenLink
              decos.push(link2.range(node.from  + splitIndex + 1, node.to))

            }else{
              const text = getChapterFromLink(rawText)
              const link = index.keys[text] !== undefined ? workingLink : brokenLink
              decos.push(link.range(node.from, node.to))
            }
          }
        }else if(node.name == 'ATXHeading1'){
          decos.push(bookTitle.range(node.from, node.to))
        }else if(node.name == 'ATXHeading3'){
          decos.push(heading.range(node.from, node.to))
        }else if(node.name == 'InlineCode' || node.name == 'FencedCode'){

          const rawText = view.state.doc.sliceString(node.from, node.to)

          let style = null
          for(const [key, property] of Object.entries(index.properties)){
            if(key.startsWith('code-') && rawText.startsWith('`' + key.substring('code-'.length))) style = property
          }
          const code = Decoration.mark({attributes: {class: "cm-mage-code", style}, inclusive: true})

          decos.push(code.range(node.from, node.to))
        }else if (node.name == 'Paragraph') {
          if(node.to < endTitlePage){
            const lines = view.state.doc.sliceString(node.from, node.to).split('\n')
            let accumulator = 0
            for(const line of lines){
              const colon = line.indexOf(':')
              if(colon!= -1){
                decos.push(property.range(node.from + accumulator, node.from + accumulator + colon + 1))
              }
              accumulator += line.length + 1
            }
          }
            //applyAll(rawText, /([^:]+:).*(?:\n|$)/gm, property, decos, node)

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
  return Decoration.set(decos)
}



const magePlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet
  editor: EditorView

  constructor(editor: EditorView) {
    const text = editor.state.doc.toString()
    const index = indexBook(text)
    this.decorations = getLinkDecorations(editor, {text, index})
    this.editor = editor
  }

  update(update: ViewUpdate) {

    if(String(get(s.singleChapterMode)) === "2"){
      console.log("preventing update")
      if(!update.transactions.map( t => t.effects).some(effects => effects.some( eff => eff.value === 'subviewUpdate'))){
        const $allowedRange = get(allowedRange)
        const { from, to} = update.view.state.selection.main
        // Calculate
        const allowedFrom = Math.min($allowedRange[1], Math.max(from, $allowedRange[0]))
        const allowedTo = Math.max($allowedRange[0], Math.min(to, $allowedRange[1]))

        if(allowedFrom !== from || allowedTo !== to){
          setTimeout( () =>     this.editor.dispatch({
            selection: EditorSelection.create([
              EditorSelection.range(allowedFrom, allowedTo),
            ]),
          }))
          return
        }else{
          cursorPosition.lazySet(update.view.state.selection.main)
        }
      }else{
        cursorPosition.set(update.view.state.selection.main)
      }
    }else{
      //console.log("allowing ", get(s.singleChapterMode))
      cursorPosition.lazySet(update.view.state.selection.main)
    }



    if (update.docChanged || update.viewportChanged){


      this.decorations = getLinkDecorations(update.view,
        onChangeCallback(update.view.state.doc.toString())
      )
    }
  }
}, {
  decorations: v => v.decorations,

  eventHandlers: {
    mousedown: (e, view) => {
      let target = e.target as HTMLElement
      if(target.classList.contains('tok-link')) target = target.parentElement
      if(target.classList.contains('cm-mage-workinglink') || target.classList.contains('cm-mage-brokenlink')){

        // [sp] we get the closest cm-line ancestor, as the link could be split in multiple <div>s due to how
        // firepad highlights text
        const parentLine = target.closest('.cm-line')


        let totalText = parentLine.textContent
        let elementsText = '' // this will include all the text that comes before the one clicked by the user
        function iterate(instance, target) {
          if(instance == target) return true

          for (let child of instance.childNodes) {
            if(child.nodeType == Node.TEXT_NODE) elementsText += child.textContent
            if(iterate(child, target)) return true;
          }
          return false
        }

        iterate(parentLine, target)

        const notFoundBecomesInfinity = (a) => a === -1 ? Infinity : a


        const firstClosingBracket = Math.min(
          notFoundBecomesInfinity(totalText.indexOf(')', elementsText.length)),
          notFoundBecomesInfinity(totalText.indexOf(']', elementsText.length)),
        )
        const firstOpeningSquare = totalText.lastIndexOf('[', firstClosingBracket)
        const text = getChapterFromLink(totalText.substring(firstOpeningSquare))
        goToKey(text)

        e.preventDefault()
        e.stopPropagation()
        return false
      }
    },

  },

})



export const subviewChapter = writable(null)

const displayedLine = Decoration.replace({})


const getSubviewDecorations = () => {

  let builder = new RangeSetBuilder<Decoration>()
  const $subviewChapter = get(subviewChapter)
  if(!$subviewChapter)   return builder.finish();

  for(let [from, to] of $subviewChapter){

    builder.add(from, to, displayedLine)

  }
  return builder.finish()
}



const subviewPlugin = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(_, __) {
    return getSubviewDecorations()
  },
  provide: f => EditorView.decorations.from(f)
})



export const setupCodemirror = (text : string) => {
  const extensions = isVSCode
    ? [
      highlightSpecialChars(),
      history(),
      drawSelection(),
      highlightActiveLine(),
      markdown(),
      search(),
      EditorView.lineWrapping,
      syntaxHighlighting(classHighlighter),
      EditorView.contentAttributes.of({ spellcheck: 'true' }),

      magePlugin,
      subviewPlugin,

      keymap.of([
        ...defaultKeymap,
        ...searchKeymap,
        indentWithTab,
      ])
    ] : [
      highlightSpecialChars(),
      history(),
      drawSelection(),
      highlightActiveLine(),
      markdown(),
      search(),
      EditorView.lineWrapping,
      syntaxHighlighting(classHighlighter),
      EditorView.contentAttributes.of({ spellcheck: 'true' }),

      magePlugin,
      subviewPlugin,

      keymap.of([
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        { ...historyKeymap[1] , key: 'Mod-Shift-z'},
        indentWithTab
      ])
    ]


  const editor = new EditorView({
    doc: text,
    parent: document.getElementById(editorComponentID),
    extensions,

  })





  window['editor'] = editor

  return [editor, extensions]
}
