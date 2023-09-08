<script lang="ts">
  import { _ } from 'svelte-i18n'
	import { onMount } from 'svelte'
  import { session } from '../javascript/database.js'

  import { showSidemenu, isSynced, store } from '../javascript/store.js'
  import { editorComponentID } from '../javascript/codemirror';

  import { isVSCode, loadVSSession } from '../javascript/vscode.js';

  import EditorButtons from './EditorButtons.svelte';

  import {s} from '../javascript/settings'
  const {font, fontSize, pageWidth, pageZoom, titleHighlight, justifyText, lineMargin, lineSpacing, countChars} = s

  let book = null, currentChapterFullTitle = null
  store.then( r => ({book, currentChapterFullTitle} = r))


  onMount(() => {
    if(!isVSCode){
      session.load()

    }else{
      loadVSSession()
    }
  })




</script>

<main class="editor" style={
`--mage-settings-font: ${$font.trim()};
 --mage-settings-fontsize: ${Number(String($fontSize).trim()) * $pageZoom / 100}pt;
 --mage-settings-pagewidth: ${Number(String($pageWidth).trim()) * 2.85 * $pageZoom / 100}pt;
 --mage-settings-linemargin: ${String($lineMargin).trim()}px;
 --mage-settings-linespacing: ${String($lineSpacing).trim()};
 --mage-settings-textalign: ${$justifyText == '1' ? 'left' : 'justify'};
 ${$titleHighlight == '1' ? '--mage-settings-titlehighlight: transparent;' : ''}`
 }>

  {#if !isVSCode}


  <div class="toolbar">
    <h1 class="only-desktop" on:click={ () => $showSidemenu = !$showSidemenu} title={currentChapterFullTitle && $currentChapterFullTitle}>
      {$currentChapterFullTitle}
    </h1>

    <EditorButtons></EditorButtons>
  </div>
{/if}


  <div class="textarea" id={editorComponentID}>

  </div>
  <div class="margin">
    {#if book && String($countChars) === '2'}
    <span class="chars-count">{($book.text || "").length + ' ' + $_('editor.chars')}</span>
    {/if}
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

  .chars-count {
    color: #555;
    font-size: 11px;
    user-select: none;
  }

  :global(#main-editor){
    background-color: #fff;
    font-size: 14pt;
    font-size: var(--mage-settings-fontsize, 14pt);
  }

  :global(#main-editor .cm-activeLine){
    background-color: #94949414;
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
  :global(.vscode) main {
    grid-template-rows: 1fr;
    grid-template-areas:
      "textarea";
  }

  .toolbar {
    @apply z-[50];
    background-color: #eee;

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



  .toolbar{
    grid-area: toolbar;
  }



  .textarea {
    grid-area: textarea;
    overflow-y: auto;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
  }

  .margin {
    float: right;
    margin-top: -5px;
    grid-area: margin;
    overflow-y: auto;
    display: flex;
    align-items: flex-end;
    justify-content: right;

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

    .toolbar > :global(*) {
      flex: 1 1 auto;
      padding-left: 0 !important;
      padding-right: 0 !important;
      text-align: center;
    }

    .toolbar >  :global(div:first-of-type) {
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


  :global( #main-editor .cm-mage-code, #main-editor .cm-mage-group, #main-editor .cm-mage-flag){
    color: #00a64a;
  }

  :global(#main-editor .cm-mage-code *, #main-editor .cm-mage-code, #main-editor .cm-mage-group, #main-editor .cm-mage-flag){
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
    padding: 4px;
    max-width: 320pt;
    max-width: calc(var(--mage-settings-pagewidth, 320pt));
    width: 90%; /*94vw;*/
    margin-left: auto;
    margin-right: auto;
    padding-top: calc(var(--mage-settings-linemargin, 4px));
    padding-bottom: calc(var(--mage-settings-linemargin, 4px));

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
    color: #00a64a;
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
    background-color: #53535333;
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



/*
:global(.cm-line:not(.cm-subview)){
  visibility: hidden  !important;
  display: none;
  user-select: none;
  pointer-events:none;


}

:global(.cm-subview.cm-line){
  visibility: visible !important;
}*/

</style>


