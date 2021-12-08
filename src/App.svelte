<script>
  /* Componente base dell'applicazione
  Importa gli altri componenti e li dispone a schermo
  @Luca Fabbian - v1.0 */

  import Dialogs from './components/Dialogs.svelte'
  import Navbar  from './components/Navbar.svelte'
  import Editor  from './components/Editor.svelte'
  import Sidebar from './components/Sidebar.svelte'
  import LocalOnboarding from './components/LocalOnboarding.svelte'

  import { bookIndex } from './javascript/new-book.js'
  import { handleShortcuts } from './javascript/shortcuts.js'
  import { isApp, appPath } from './javascript/appMode.js'

  $: { if(!(/bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i.test(navigator.userAgent))){
    if($bookIndex && $bookIndex.properties.title){
      document.title = $bookIndex.properties.title + " - Magebook"
    }
  } }
</script>


<svelte:window on:keydown={handleShortcuts}/>

{#if $isApp && $appPath == ''}
  <LocalOnboarding  />
{:else}

  <Dialogs />
  <Navbar />
  <Sidebar />
  <Editor />
{/if}


<style>
  :global(body, html) {
    margin: 0;
    padding: 0;
    color: black;
    box-sizing: border-box;
    font-family: arial,sans-serif;
    height: 100%;
    overscroll-behavior-y: contain;
    overflow-x: hidden !important;
  }

  :global(body){
    display: grid;
    width: 100vw;
    
    grid-template-rows: minmax(min-content, max-content) 1fr;
    grid-template-columns: 1fr calc(20vw + 140px);
    grid-template-areas: 
      "navbar navbar"
      "editor sidebar"
  }
  @media only screen and (max-width: 680px) {
    :global(body){
      grid-template-columns: 1fr;
      grid-template-areas: 
      "navbar"
      "editor"
    }
  }

  :global(main, aside, nav){
    min-width: 0; 
    min-height: 0; 
    overflow: auto;
    overscroll-behavior: contain;
  }


  /* Select replacement, adapted from
  https://codepen.io/rabakilgur/pen/zyggOe */
  :global(.select-dropdown,
  .select-dropdown * ){
    margin: 0;
    padding: 0;
    position: relative;
    box-sizing: border-box;
    display: inline-block;
  }
  :global(.select-dropdown) {
    position: relative;
    background-color: #E6E6E6;
    border-radius: 4px;
  }
  :global(.select-dropdown:hover) {
    background-color: #dfdfdf;
  }
  :global(.select-dropdown select) {
    font-size: 1rem;
    font-weight: normal;
    max-width: 100%;
    padding: 8px 24px 8px 10px;
    border: none;
    background-color: transparent;
      -webkit-appearance: none;
      -moz-appearance: none;
    appearance: none;
  }
  :global(.select-dropdown select:active, .select-dropdown select:focus) {
    outline: none;
    box-shadow: none;
  }
  :global(.select-dropdown:after) {
    content: "";
    position: absolute;
    top: 50%;
    right: 8px;
    width: 0;
    height: 0;
    margin-top: -2px;
    border-top: 5px solid #aaa;
    border-right: 5px solid transparent;
    border-left: 5px solid transparent;
  }
</style>
