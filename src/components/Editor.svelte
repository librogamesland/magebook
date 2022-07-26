<script lang="ts">
  import { _ } from 'svelte-i18n'
	import { onMount } from 'svelte'
  import { EditorView } from 'codemirror';
  import { undo, redo } from '@codemirror/commands'
  import { openSearchPanel } from '@codemirror/search'
  import { session } from '../javascript/database.js'
  import { cursorPosition, getEditor, currentChapterFullTitle, currentChapterKey, bookIndex } from '../javascript/editor.js'
  import { ctrlShortcuts } from '../javascript/shortcuts.js'

  import { showSidemenu, isSynced } from '../javascript/editor'
  import { editorComponentID } from '../javascript/codemirror';
  import { firstAvaiableKey, addChapter, getRightOrderKey} from '../javascript/actions'
  import { isApp, loadAppMode } from '../javascript/appMode'


  import {font, fontSize, editorMargins, titleHighlight, justifyText, lineMargin, lineSpacing} from '../javascript/settings'

  
  

  onMount(() => {
    if($isApp){
      loadAppMode()
      return
    }
    session.load()
  })


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

    const {contentStart, end } = $bookIndex.chapters.get($currentChapterKey)
    
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

    addChapter(key, `\n\n### ${key}`)

    if(getRightOrderKey(key) <= contentStart) to += `\n\n### ${key}`.length + 1
    getEditor().dispatch({
      selection: {anchor: to},
      effects: [
      EditorView.scrollIntoView(to)
    ]})



    getEditor().focus()
  }

  ctrlShortcuts({
    'K': () => addQuickLink(),
    'L': () => addLink()
  })


</script>

<main class="editor" style={
`--mage-settings-font: ${$font.trim()};
 --mage-settings-fontsize: ${String($fontSize).trim()}pt;
 --mage-settings-editormargins: ${$editorMargins.trim()};
 --mage-settings-linemargin: ${String($lineMargin).trim()}px;
 --mage-settings-linespacing: ${String($lineSpacing).trim()};
 --mage-settings-textalign: ${$justifyText == '1' ? 'left' : 'justify'};
 ${$titleHighlight == '1' ? '--mage-settings-titlehighlight: transparent;' : ''}`
 }>
  <div class="toolbar">
    <h1 class="only-desktop" on:click={ () => $showSidemenu = !$showSidemenu} title={$currentChapterFullTitle}>
      {$currentChapterFullTitle}
    </h1>
    
    <div on:click={async() => {
      openSearchPanel(getEditor())
    }} title={$_('editor.buttons.find')}><span class="icon-search"/></div>

    <div on:click={async() => {
      undo(getEditor())
    }} title={$_('editor.buttons.undo')}><span class="icon-ccw"/></div>

    <div on:click={async() => {
      redo(getEditor())
    }} title={$_('editor.buttons.redo')}><span class="icon-cw"/></div>
    
    <div on:click={addQuickLink} title={$_('editor.buttons.quicklink')}>
      <span class="link">[<span class="icon-flash"/>]</span>
    </div>

    <div on:click={addLink} title={$_('editor.buttons.link')}>[L]</div>
  </div>
  
  <div class="textarea" id={editorComponentID}>
    
  </div>
  <div class="margin">
    {#if $isSynced === true}
      <i class="icon-ok" style="color: green;"></i>
    {:else if $isSynced === false}
    <div>
      <i class="icon-arrows-cw animate-spin" style="width: fit-content;"></i>
    </div>
    {/if}
  </div>
</main>

<style>

  :global(#main-editor){
    background-color: #fff;
    font-size: 14pt;
    font-size: var(--mage-settings-fontsize, 14pt);
  }

  :global(#main-editor .cm-activeLine){
    background-color: #ededed;
  }

  :global(#main-editor .cm-content){
    padding: 1.4rem 0 !important;
  }



  :global(.firepad){
    display: flex;
  }

  :global(.firepad > div){
    flex-grow: 1;
  }

  :global(.mage-theme-dark #main-editor .cm-panels button){
    border-radius: 4px;
    padding: 4px 15px;
    font-family: Arial, Helvetica, sans-serif;
  }


  :global(#main-editor .cm-mage-heading){
    color: #000 !important;
    font-weight: bolder;
    background-color: #d4d4d4;
    background-color: var(--mage-settings-titlehighlight, #d4d4d4);
    font-size: 110%;
    padding: 0px 4px;
  }

  :global(#main-editor .cm-mage-booktitle){
    color: #000 !important;
    font-weight: 800;
    font-size: 130%;
  }

  :global(#main-editor .tok-heading.tok-meta){
    display: inline-block;
    margin-top: 1.5rem;
  }



  /* Markup del componente */
  main {
    grid-area: editor;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: auto 1fr 16px;
    grid-template-areas: 
      "toolbar"
      "textarea"
      "margin";
  }

  .toolbar {
    background-color: #eee;
    z-index: 100;
    box-shadow: 0 4px 20px rgb(0 0 0 / 25%);
    display: flex;
    flex-direction: row;
    align-items: center;
    min-height: calc(1.9rem + 18px);
    padding-left: 1.4rem;
  }

  h1 {
    flex-grow: 1;
    text-overflow: ellipsis;
    font-size: 20px;
    overflow: hidden;
    white-space: nowrap;
    padding: 0.4rem 0 0.3rem;
    margin-block: 0;
    margin-inline: 0;

  }

  span.icon-flash::before{
    margin: 0 !important;
    margin-left: -2px !important;
  }

  .toolbar{
    grid-area: toolbar;
  }

  .toolbar > div {
    color: rgb(22, 12, 92);
    text-decoration: underline;
    border-left: rgb(192, 192, 192) solid 1px;
    padding: 7px 22px 6px;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }  

  .textarea {
    grid-area: textarea;
    overflow-y: auto;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
  }

  .margin {
    margin-top: -5px;
    grid-area: margin;
    overflow-y: auto;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
    background-color: #fff;
    text-align: right;
    overflow: hidden;
  }

  .margin i {
    font-size: 11px;
    margin-top: 4px;
  }


  @media only screen and (max-width: 500px) {
    .only-desktop {
      display: none;
    }

    .toolbar {
      display: flex;
      padding-left: 0 !important;
    }

    .toolbar > * {
      flex: 1 1 auto;
      padding-left: 0 !important;
      padding-right: 0 !important;
      text-align: center;
    }
    
    .toolbar > div:first-of-type {
      border: 0 !important;
    }
  }



  :global(#main-editor *) {
    font-family: Arial, Helvetica, sans-serif;
    font-family: var(--mage-settings-font, Arial, Helvetica, sans-serif);
    outline: none !important;
  }

  :global(.ace_constant){
    color: #006d1b;
  }
  :global(#main-editor .cm-mage-workinglink, #main-editor .cm-mage-workinglink *){
    pointer-events: auto !important;
    cursor: pointer;
    color: rgb(17, 0, 172);
  }

  :global(#main-editor .cm-mage-workinglink:hover, #main-editor .cm-mage-brokenlink:hover){
    text-decoration: underline;
  }

  :global(#main-editor .cm-mage-brokenlink, #main-editor .cm-mage-brokenlink *){
    pointer-events: auto !important;
    cursor: not-allowed;

    color: rgb(189 0 0);
    background-color: #faa;
  }


  :global(#main-editor .cm-mage-code *, #main-editor .cm-mage-code, #main-editor .cm-mage-group, #main-editor .cm-mage-flag){
    color: #00a64a !important;
    font-family: monospace !important;
  }

  :global(#main-editor .tok-strong, #main-editor .cm-mage-HTMLb){
    font-weight: 700 !important;
    color: #444 !important;
  }

  :global(#main-editor .tok-emphasis, #main-editor .cm-mage-HTMLi){
    font-style: italic;
    color:  #444 !important;
  }

  :global( #main-editor .cm-mage-HTMLu){
    text-decoration: underline;
    color:  #444 !important;
  }

  :global(.cm-scroller){
    padding-bottom: 25px;
  }


  :global(#main-editor .cm-line){
    padding: 4px calc(20% - 45px);
    padding-top: calc(var(--mage-settings-linemargin, 4px));
    padding-bottom: calc(var(--mage-settings-linemargin, 4px));

    padding-left: calc(var(--mage-settings-editormargins, calc(20% - 45px)));
    padding-right: calc(var(--mage-settings-editormargins, calc(20% - 45px)));

    line-height: 140%;
    line-height: calc(var(--mage-settings-linespacing, 140%));

    text-align: var(--mage-settings-textalign, left);
  }


:global(.mage-theme-dark #main-editor){
  color: #ccc !important;
  background-color: #0f0f0f !important;
}

:global(.mage-theme-dark .toolbar){
  box-shadow: 0 4px 20px rgb(0 0 0 / 75%) !important;
}


:global(.mage-theme-dark .toolbar, .mage-theme-dark .margin){
  color: #ddd !important;
  background-color: #1a1a1a !important;
}


:global(.mage-theme-dark .toolbar > div){
  color: rgb(213 107 255) !important;
  border-left: #292929 solid 1px !important;
}  


:global(.mage-theme-dark #main-editor .cm-mage-heading){
  background-color: #333;
  background-color: var(--mage-settings-titlehighlight, #333);

}

:global(.mage-theme-dark #main-editor .tok-heading){
    color: #fff !important;
}  



:global(.mage-theme-dark #main-editor .cm-mage-workinglink, .mage-theme-dark #main-editor .cm-mage-workinglink *){

  color: #5166ff !important;
}

:global(.mage-theme-dark #main-editor .cm-mage-brokenlink, .mage-theme-dark #main-editor .cm-mage-brokenlink *){
  color: rgb(254 10 10) !important;
  background-color: rgb(53 0 0) !important;
  
}

:global(
  .mage-theme-dark #main-editor .cm-mage-code,
  .mage-theme-dark #main-editor .cm-mage-group,
  .mage-theme-dark #main-editor .cm-mage-flag
){
    color: #00a64a !important;
  }

:global(.mage-theme-dark #main-editor .tok-strong, .mage-theme-dark #main-editor .cm-mage-HTMLb){
  color: #999 !important;
}

:global(.mage-theme-dark #main-editor .tok-emphasis, .mage-theme-dark #main-editor .cm-mage-HTMLi){
  color:  #999 !important;
}

:global(.mage-theme-dark #main-editor .cm-mage-HTMLu){
  color:  #999 !important;
}


:global(.mage-theme-dark select){
    color: #fff !important;
    background-color: #424242 !important;

}

:global(.mage-theme-dark #main-editor .cm-activeLine){
    background-color: #222;
  }



:global(.mage-theme-dark #main-editor .cm-selectionBackground ){
  background: rgb(0, 59, 71) !important;
}


:global(.mage-theme-dark #main-editor .cm-panels){
  background-color: #1a1a1a !important;
  color: #fff;
}

:global(.mage-theme-dark #main-editor .cm-panels-bottom, .mage-theme-dark #main-editor .cm-panel button){
  background: #000;
}

:global(.mage-theme-dark #main-editor .cm-panels-bottom, .mage-theme-dark #main-editor .cm-panel button:hover){
  background: #444;
}

:global(.mage-theme-dark #main-editor .cm-panels-bottom, .mage-theme-dark #main-editor .cm-panel button[name="close"]){
  background: transparent;
  border: 0 !important;
}

:global(.mage-theme-dark #main-editor .cm-panels-bottom, .mage-theme-dark #main-editor .cm-panel input){
  background-color: #1d1d1d;
  border: 2px #161616 solid;
  color: #ddd;
}

:global(.mage-theme-dark #main-editor .cm-searchMatch){
  background-color: #ffff001c;
  border: 0.5px solid #ffff001c;
}

:global(.mage-theme-dark #main-editor .cm-searchMatch-selected){
  background-color: #ffff0054;
}

:global(.mage-theme-dark #main-editor .cm-content) {
    caret-color: #ccc;
}
:global(.mage-theme-dark #main-editor .cm-focused .cm-cursor){
    border-left-color: #ccc;
}





/*
   Animation example, for spinners
*/
.animate-spin {
  -moz-animation: spin 2s infinite linear;
  -o-animation: spin 2s infinite linear;
  -webkit-animation: spin 2s infinite linear;
  animation: spin 2s infinite linear;
  display: inline-block;
}
@-moz-keyframes spin {
  0% {
    -moz-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  100% {
    -moz-transform: rotate(359deg);
    -o-transform: rotate(359deg);
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}
@-webkit-keyframes spin {
  0% {
    -moz-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  100% {
    -moz-transform: rotate(359deg);
    -o-transform: rotate(359deg);
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}
@-o-keyframes spin {
  0% {
    -moz-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  100% {
    -moz-transform: rotate(359deg);
    -o-transform: rotate(359deg);
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}
@-ms-keyframes spin {
  0% {
    -moz-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  100% {
    -moz-transform: rotate(359deg);
    -o-transform: rotate(359deg);
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}
@keyframes spin {
  0% {
    -moz-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  100% {
    -moz-transform: rotate(359deg);
    -o-transform: rotate(359deg);
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}
</style>


