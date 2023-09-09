<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { EditorView } from 'codemirror';
  import { undo, redo } from '../javascript/history'
  import { openSearchPanel } from '@codemirror/search'
  import { nullUntilLoaded } from '../javascript/store.js'
  import { ctrlShortcuts } from '../javascript/shortcuts.js'

  import { isVSCode } from '../javascript/vscode.js';
  import { cursorPosition } from '../javascript/codemirror';
  import { firstAvaiableKey, getRightOrderKey } from '../javascript/book-utils';


  $: ({book, currentChapterKey, editor} = $nullUntilLoaded)


  const addChapter = (key, text) => {

    const index = editor.state.doc.line(getRightOrderKey(book, key, currentChapterKey) + 1).to
    editor.dispatch({
      changes: { from: index, to: index, insert: '\n' + text },
    })

  }

  const addLink = () => {

    const {from, to} = $cursorPosition

    const short = book.index.properties['disableShortLinks'] == 'true'
    editor.dispatch({ changes: { from: to, to, insert: short ? '[](#)' : '[]' }, })

    editor.dispatch({
      selection: {anchor: to +  (short ? 4: 1)},
      effects: [
      EditorView.scrollIntoView(to)
    ]})

    editor.focus()

  }




  const addQuickLink = () => {
    let { from, to} = $cursorPosition

    const {contentStart, end, group } = book.index.chapters.get($currentChapterKey)

    const key = firstAvaiableKey(book)
    const link = book.index.properties['disableShortLinks'] == 'true'
      ? `[](#${key})`
      : `[${key}]`



    if(contentStart != (editor.state.doc.lineAt(to).number -1) ){
      editor.dispatch({ changes: { from: to, to, insert: link }, })
      to += link.length
    }else{
      // Special case: if is on same line of heading, create a new line skip
      editor.dispatch({ changes: { from: to, to, insert: '\n' + link }, })
      to += link.length + 1

    }
    const cText = group ? `\n\n### ${key}\n[group]:<> ("${group}")` : `\n\n### ${key}`
    addChapter(key, cText)

    if(getRightOrderKey(book, key, $currentChapterKey) <= contentStart) to += cText.length + 1
    editor.dispatch({
      selection: {anchor: to},
      effects: [ EditorView.scrollIntoView(to)]
    })



    editor.focus()

  }

  ctrlShortcuts({
    'K': () => addQuickLink(),
    'L': () => addLink()
  })
</script>


<div class="nav-element" on:click={async() => {
  openSearchPanel(editor)
}} title={$_('editor.buttons.find')}><span class="icon-search"/></div>

{#if !isVSCode}
<div class="nav-element" on:click={async() => {
  undo(editor)
}} title={$_('editor.buttons.undo')}><span class="icon-ccw"/></div>

<div class="nav-element" on:click={async() => {
  redo(editor)
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