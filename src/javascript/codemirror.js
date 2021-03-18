/* Configurazione dell'editor Codemirror, basata su
https://github.com/codemirror/basic-setup/blob/main/src/basic-setup.ts */

import {EditorView } from "@codemirror/basic-setup"
import {markdown} from "@codemirror/lang-markdown"
import {HighlightStyle, tags as t} from "@codemirror/highlight"


import {keymap, highlightSpecialChars, highlightActiveLine} from "@codemirror/view"
import {EditorState, EditorSelection, Prec} from "@codemirror/state"
import {history, historyKeymap} from "@codemirror/history"
import {indentOnInput} from "@codemirror/language"
import {defaultKeymap} from "@codemirror/commands"
import {bracketMatching} from "@codemirror/matchbrackets"
import {closeBrackets, closeBracketsKeymap} from "@codemirror/closebrackets"
import {searchKeymap, highlightSelectionMatches} from "@codemirror/search"
import {autocompletion, completionKeymap} from "@codemirror/autocomplete"
import {rectangularSelection} from "@codemirror/rectangular-selection"
import {commentKeymap} from "@codemirror/comment"
import {tags} from "@codemirror/highlight"
import {lintKeymap} from "@codemirror/lint"



// Stile di highlight
const defaultHighlightStyle = HighlightStyle.define(
  {tag: tags.monospace,
    color: "#a48a8a", fontFamily: "monospace !important"}, 
  {tag: tags.link,
   textDecoration: "underline"},
  {tag: tags.emphasis,
   fontStyle: "italic"},
  {tag: tags.strong,
   fontWeight: "bold"},
  {tag: tags.keyword,
   color: "#708"},
  {tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
   color: "#219", cursor:"pointer"},
  {tag: [tags.literal, tags.inserted],
   color: "#164"},
  {tag: [tags.string, tags.deleted],
   color: "#a11"},
  {tag: [tags.regexp, tags.escape, tags.special(tags.string)],
   color: "#e40"},
  {tag: tags.definition(tags.variableName),
   color: "#00f"},
  {tag: tags.local(tags.variableName),
   color: "#30a"},
  {tag: [tags.typeName, tags.namespace],
   color: "#085"},
  {tag: tags.className,
   color: "#167"},
  {tag: [tags.special(tags.variableName), tags.macroName, tags.local(tags.variableName)],
   color: "#256"},
  {tag: tags.definition(tags.propertyName),
   color: "#00c"},
  {tag: tags.comment,
   color: "#940"},
  {tag: tags.meta,
   color: "#7a757a"},
  {tag: tags.invalid,
   color: "#f00"}
)


      

const defaultExtensions = (onLinksClick) => ([
  highlightSpecialChars(),
  history(),
  EditorState.allowMultipleSelections.of(true),
  EditorView.lineWrapping,
  EditorView.domEventHandlers({
    'click': (e) => {
        const el = e.target
        // Dirty hack: per individuare un link, uso il colore
        // con cui è stato evidenziato. 
        if(getComputedStyle(el).getPropertyValue('color') === 'rgb(34, 17, 153)'){
          onLinksClick(String(el.innerHTML).trim())
        }
    },
  }),
  indentOnInput(),
  Prec.fallback(defaultHighlightStyle),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...commentKeymap,
    ...completionKeymap,
    ...lintKeymap
  ]),
  markdown(),
])


export {EditorView, EditorState, EditorSelection, defaultExtensions }
