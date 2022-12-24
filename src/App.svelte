<script>
  /* Componente base dell'applicazione
  Importa gli altri componenti e li dispone a schermo
  @Luca Fabbian - v1.0 */
  import {_} from 'svelte-i18n'
  import Dialogs from './components/Dialogs.svelte'
  import { dialog } from './components/Dialogs.svelte'
  import Alert from './components/dialogs/Alert.svelte'
  import Navbar  from './components/Navbar.svelte'
  import Editor  from './components/Editor.svelte'
  import Sidebar from './components/Sidebar.svelte'
  import { bookIndex, isLoaded } from './javascript/new-book'
  import { handleShortcuts } from './javascript/shortcuts'
  import { initError }from './javascript/editor'
  import { s } from './javascript/settings' 
  import manifest from '../package.json'
  import { isVSCode } from './javascript/vscode';

  const { theme } = s
  
  // Change theme from dark to light and vice versa
  $: {
    const b = window.document.body
    b.className.split(' ').forEach(c => {
      if(c.startsWith('mage-theme-')) b.classList.remove(c)
    })
    b.classList.add('mage-theme-' + $theme)
  }
  $: style = `<style>
  :root {
    color-scheme: ${$theme == 'dark' ? 'dark' : 'light'};
  }
  </style>`

  if(isVSCode) window.document.body.classList.add('vscode')



  // Change page title if the page is visited by a real user 
  // keep "Magebook" title for web engines
  $: { if(!(/bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i.test(navigator.userAgent))){
    if($bookIndex && $bookIndex.properties.title){
      document.title = $bookIndex.properties.title + " - Magebook"
    }
  } }
  // Version popup
  const key = 'mage-version'
  if(!localStorage[key]){
    localStorage[key] = manifest.version
  } 
  const version = localStorage[key]
  try {
    const [savedMajor, minor, savedPatch] = version.split('.')
    const [currentMajor, currentMinor, ] = manifest.version.split('.')
    console.log('Checking migration from: ', version, ' to:', manifest.version)

    if(savedMajor !== currentMajor || minor !== currentMinor){
      dialog(
          Alert,
          $_('dialogs.version.title') + manifest.version, 
          $_('dialogs.version.' + currentMajor + '.' + currentMinor) + '<br><br>' + $_('dialogs.version.text')
        ).then( () => localStorage[key] = manifest.version)
    }else{
      localStorage[key] = manifest.version
    }
  }catch(e){}
</script>

<svelte:head>
  {@html style}
</svelte:head>

<svelte:window on:keydown={handleShortcuts}/>

{#if !$isLoaded}
  <div class="loading-mask">
    <div class="dialog" style="text-align: center; margin-top: 10vh">
      <div class="spinner-1"></div>
      <p style="color:white">{$initError}</p>
    </div>
    
  </div>
{/if}
<Dialogs />
<Navbar />
<Sidebar />
<Editor />


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
  .loading-mask {
    grid-column-start: 1;
    grid-column-end: -1;
    grid-row-start: 2;
    grid-row-end: 2;
    background-color: #252525;
    opacity: 0.7;
    z-index: 100;
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