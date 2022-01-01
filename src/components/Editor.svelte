<script>
  import { _ } from 'svelte-i18n'
	import { onMount, tick } from 'svelte'
  import { session } from '../javascript/database.js'
  import { cursorPosition, getEditor, editorComponentID, currentChapterFullTitle } from '../javascript/editor.js'
  import { ctrlShortcuts } from '../javascript/shortcuts.js'

  import { showSidemenu, isSynced } from '../javascript/editor.js'
  import { firstAvaiableKey, addChapter} from '../javascript/actions.js'
  import { isApp, loadAppMode } from '../javascript/appMode.js'


  
  

  onMount(() => {
    if($isApp){
      loadAppMode()
      return
    }
    session.load()
  })


  const addLink = () => {
    const { row, column} = $cursorPosition
    
    getEditor().session.replace(new ace.Range(row, column, row, column), '[](#)');
    getEditor().clearSelection()
    getEditor().moveCursorTo(row, column + 4);

    getEditor().focus()


  }

  

  const addQuickLink = () => {
    const { row, column} = $cursorPosition
    
    const key = firstAvaiableKey()
    const link = `[](#${firstAvaiableKey()})`

    addChapter(key, `\n\n### ${key}`)

    getEditor().session.replace(new ace.Range(row, column, row, column), link);
    getEditor().clearSelection()
    getEditor().moveCursorTo(row, column + link.length);

    getEditor().focus()
  }

  ctrlShortcuts({
    'K': () => addQuickLink(),
    'L': () => addLink()
  })


</script>

<main class="editor">
  <div class="toolbar">
    <h1 on:click={ () => $showSidemenu = !$showSidemenu}>
      {$currentChapterFullTitle}
    </h1>
    
    <div class="only-desktop" on:click={async() => {
      getEditor().execCommand('find')
    }} title={$_('editor.buttons.find')}><span class="icon-search"/></div>

    <div class="only-desktop" on:click={async() => {
      getEditor().execCommand('undo')
    }} title={$_('editor.buttons.undo')}><span class="icon-ccw"/></div>

    <div class="only-desktop" on:click={async() => {
      getEditor().execCommand('redo')
    }} title={$_('editor.buttons.redo')}><span class="icon-cw"/></div>
    
    <div on:click={addQuickLink} title={$_('editor.buttons.quicklink')}>
      <span class="link">#<span class="icon-flash"/></span>
    </div>

    <div on:click={addLink} title={$_('editor.buttons.link')}>#L</div>
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

  :global(.ace_mobile-menu){
    transform: translateY(-4px);
  }
  :global(.ace_mobile-button){
    line-height: 2;
    padding-bottom: 8px;
    padding-top: 8px;
  }

  :global(.ace_mobile-button[action=find]:after){
    padding: 8px;
    font-family: "fontello";
    content: '\e800';
  }

  :global(.ace_mobile-button[action=undo]:after){
    padding: 8px;
    font-family: "fontello";
    content: '\e804';
  }

  :global(.ace_mobile-button[action=copy]:after){
    padding: 8px;
    font-family: "fontello";
    content: '\f0c5';
  }

  :global(.ace_mobile-button[action=cut]:after){
    padding: 8px;
    font-family: "fontello";
    content: '\e803';
  }

  :global(.ace_mobile-button[action=paste]:after){
    padding: 8px;
    font-family: "fontello";
    content: '\f0ea';
  }

  :global(.ace_mobile-button[action=selectall]){
    display: none;
  }

  :global(.ace_mobile-button[action=openCommandPallete]){
    display: none;
  }
  
  

  :global(.firepad){
    display: flex;
  }

  :global(.firepad > div){
    flex-grow: 1;
  }


  :global(.ace_heading){
    /*#c60000*/color: #000 !important;
    font-weight: 700;
  }

  :global(.ace_gutter-cell){
    color: #888;
  }


  /* Markup del componente */
  main {
    grid-area: editor;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: auto 1fr 16px;
    grid-gap: 1px;
    grid-template-areas: 
      "toolbar"
      "textarea"
      "margin";
    background-color: rgb(192, 192, 192);
  }

  .toolbar {
    background-color: #fff;
    display: flex;
    flex-direction: row;
    align-items: center;
    min-height: calc(1.67rem + 18px);
  }

  h1 {
    flex-grow: 1;
    text-overflow: ellipsis;
    font-size: 18px;
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


  @media only screen and (max-width: 680px) {
    .only-desktop {
      display: none;
    }


    :global(.ace_search_field){
      min-width: 0 !important;
    }
  }

  @media only screen and (max-width: 420px) {
    :global(.ace_search){
      width: 100% !important;
      box-sizing: border-box;
    }
  }



  :global(.editor *) {
    /*font-family: Arial, sans-serif;*/
    outline: none !important;
  }

  :global(.ace_underline){
    pointer-events: auto !important;
    cursor: pointer;
  }
  :global(.cm-scroller){
    padding-bottom: 25px;
  }

  .toolbar{
    padding-left: calc(6vw - 8px);
  }
  :global(.cm-line){
    padding: 7px calc(6.5vw - 10px) !important;
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


