<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { EditorView } from 'codemirror';
  import { undo, redo } from '../javascript/history'
  import { openSearchPanel } from '@codemirror/search'
  import { cursorPosition, getEditor, currentChapterFullTitle, currentChapterKey, bookIndex } from '../javascript/editor.js'
  import { ctrlShortcuts } from '../javascript/shortcuts.js'

  import { firstAvaiableKey, addChapter, getRightOrderKey} from '../javascript/actions'
  import { isVSCode } from '../javascript/vscode.js';



  const addLink = () => {
    const {from, to} = $cursorPosition
    
    const short = $bookIndex.properties['disableShortLinks'] == 'true' 
    getEditor().dispatch({ changes: { from: to, to, insert: short ? '[](#)' : '[]' }, })

    getEditor().dispatch({
      selection: {anchor: to +  (short ? 4: 1)},
      effects: [
      EditorView.scrollIntoView(to)
    ]})

    getEditor().focus()


  }

  

  const addQuickLink = () => {
    let { from, to} = $cursorPosition

    const {contentStart, end, group } = $bookIndex.chapters.get($currentChapterKey)
    
    const key = firstAvaiableKey()
    const link = $bookIndex.properties['disableShortLinks'] == 'true' 
      ? `[](#${firstAvaiableKey()})`
      : `[${firstAvaiableKey()}]`



    if(contentStart != (getEditor().state.doc.lineAt(to).number -1) ){
      getEditor().dispatch({ changes: { from: to, to, insert: link }, })
      to += link.length
    }else{
      // Special case: if is on same line of heading, create a new line skip
      getEditor().dispatch({ changes: { from: to, to, insert: '\n' + link }, })
      to += link.length + 1
      
    }
    const cText = group ? `\n\n### ${key}\n[group]:<> ("${group}")` : `\n\n### ${key}`
    addChapter(key, cText)

    if(getRightOrderKey(key) <= contentStart) to += cText.length + 1
    getEditor().dispatch({
      selection: {anchor: to},
      effects: [ EditorView.scrollIntoView(to)]
    })



    getEditor().focus()
  }

  ctrlShortcuts({
    'K': () => addQuickLink(),
    'L': () => addLink()
  })
</script>


<div class="nav-element" on:click={async() => {
  openSearchPanel(getEditor())
}} title={$_('editor.buttons.find')}><span class="icon-search"/></div>

{#if !isVSCode}
<div class="nav-element" on:click={async() => {
  undo(getEditor())
}} title={$_('editor.buttons.undo')}><span class="icon-ccw"/></div>

<div class="nav-element" on:click={async() => {
  redo(getEditor())
}} title={$_('editor.buttons.redo')}><span class="icon-cw"/></div>
{/if}


<div class="nav-element" on:click={addQuickLink} title={$_('editor.buttons.quicklink')}>
  <span class="link">[<span class="icon-flash"/>]</span>
</div>

<div class="nav-element" on:click={addLink} title={$_('editor.buttons.link')}>[L]</div>


<style>
  span.icon-flash::before{
    margin: 0 !important;
    margin-left: -2px !important;
  }

  :global(.toolbar) > div {
    color: rgb(22, 12, 92);
    text-decoration: underline;
    border-left: rgb(192, 192, 192) solid 1px;
    padding: 7px 22px 6px;
  }  

  div {
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }


</style>