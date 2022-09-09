<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { ctrlShortcuts } from '../javascript/shortcuts.js'
  import { graphToImg } from '../javascript/graph.js'
  import { open, download } from '../javascript/file.js'
  import { book, isLoaded } from '../javascript/new-book.js'
  import { sortBook, compactBook} from '../javascript/book-utils'
  import { theme } from '../javascript/settings'

  import { getEditor, showSidemenu } from '../javascript/editor.js'

  import { isApp, appReload, externalLink }   from '../javascript/appMode.js'



  // Dialogs
  import { dialog }     from './Dialogs.svelte'
  import About          from './dialogs/About.svelte'
  import Confirm        from './dialogs/Confirm.svelte'
  import Img            from './dialogs/Img.svelte'
  import Shuffle        from './dialogs/Shuffle.svelte'
  import NewBook        from './dialogs/NewBook.svelte'
  import NewFirebook    from './dialogs/NewFirebook.svelte'
  import Recover        from './dialogs/Recover.svelte'
  import Settings       from './dialogs/Settings.svelte'
  import Import         from './dialogs/Import.svelte'


  ctrlShortcuts({
    'S': () => download('md', book.flush()),
    'O': () => document.getElementById('open').click()
  })


  let fullscreen = window.document.fullscreenElement ? true : false

  document.onfullscreenchange = () => {
    fullscreen = window.document.fullscreenElement ? true : false
  }
</script>


<nav>
  <div>
    <h1>{$_('navbar.file.title')}</h1>
    <div class="content">
      {#if $isApp}
        <p on:click={appReload}>{$_('app.chooseother')}</p>
        <p on:click={() => download('md', book.flush())}>{$_('dialogs.shuffle.savecopy')}</p>
      {:else}
        <p on:click={() => dialog(NewBook)}>{$_('navbar.file.new')}</p>
        <hr>
        <p on:click={() => dialog(NewFirebook)}>{$_('navbar.file.newFire')}</p>
        <hr>
        <input type="file" name="open" id="open"
          accept=".xlgc,.md"
          on:change={e => open(e.target )} />
        <label for="open">{$_("navbar.file.open")} </label>
        <!-- <p on:click={() => dialog(Import)}>{$_('navbar.file.import')}</p> -->
        <p on:click={() => download('md', book.flush())}>{$_('navbar.file.save')}</p>
        <p on:click={() => dialog(Recover)}>{$_('navbar.file.recover')}</p>
      {/if}
    </div>
  </div>
  {#if $isLoaded}
  <div>
    <h1>{$_('navbar.book.title')}</h1>
    <div class="content">
      <p on:click={() => dialog(Img, () => graphToImg(book.flush()))}>{$_('navbar.book.graph')}</p>
      <p on:click={() => dialog(Shuffle)}>{$_('navbar.book.shuffle')}</p>
      <p on:click={async() => {
        if(await(dialog(Confirm, $_('dialogs.confirm'), $_('dialogs.chapter.sort'), true))) getEditor().dispatch({
          changes: {from: 0, to: getEditor().state.doc.length, insert: sortBook($book)}
        })
      }}>{$_('navbar.book.sort')}</p>
      <p on:click={async() => {
        if(await(dialog(Confirm, $_('dialogs.confirm'), $_('dialogs.chapter.compact'), true))) getEditor().dispatch({
          changes: {from: 0, to: getEditor().state.doc.length, insert: compactBook($book)}
        })
      }}>{$_('navbar.book.compact')}</p>
      </div>
  </div>

  <div>
    <h1>{$_('navbar.export.title')}</h1>
    <div class="content">
      <p on:click={() => download('docx', book.flush())}>{$_('navbar.export.docx')}</p>
      <p on:click={() => download('fodt', book.flush())}>{$_('navbar.export.fodt')}</p>
      <p on:click={() => download('html', book.flush())}>{$_('navbar.export.html')}</p>
      <p on:click={() => download('advanced', book.flush())}>{$_('navbar.export.advanced')}</p>
      <p on:click={() => download('xlgc', book.flush())}>{$_('navbar.export.xlgc')}</p>
      <hr>
      <a on:click={externalLink} href={$_('navbar.export.otherslink')} target="_blank" rel="noopener">{$_('navbar.export.others')}</a>
      <hr>
      <a on:click={externalLink} href={$_('navbar.export.settingslink')} target="_blank" rel="noopener">{$_('navbar.export.settings')}</a>
    </div>
  </div>
  {/if}

  <!-- Help -->
  <div>
    <h1>{$_('navbar.help.title')}</h1>
    <div class="content">
      <a on:click={externalLink} target="_blank" rel="noopener" href={$_('navbar.help.guidefile')} >
        {$_('navbar.help.guide')}
      </a>
      <a on:click={externalLink} target="_blank" rel="noopener" href="https://www.librogame.net/index.php/forum/topic?id=5182&p=1#p148583">
        {$_('navbar.help.forum')}
      </a>
      <p on:click={() => dialog(About)}>{$_('navbar.help.about')}</p>
    </div>
  </div>

  {#if $isLoaded}


  <div style="margin: auto"></div>

  <span class={"nav-buttons " + ($showSidemenu ? "display" : "hidden")}>
    {#if $isApp}
    <div title={$_('navbar.buttons.fullscreen')}>
      <span aria-label={$_('navbar.buttons.fullscreen')} class={"dropbtn " + (fullscreen ? "icon-resize-small" : "icon-resize-full")}
      on:click={() => {
          if(window.document.fullscreenElement){
            window.document.exitFullscreen()
          }else{
            window.document.body.requestFullscreen()
          }
        }} />
    </div>
    {/if}

    <div title={$_('navbar.buttons.darktheme')}>
      <span aria-label={$_('navbar.buttons.darktheme')} class={"dropbtn " + ($theme == 'light' ? "icon-moon" : "icon-sun")}
        on:click={() => ($theme = ($theme == 'light' ? "dark" : "light"))} />
    </div>

    <div title={$_('navbar.buttons.settings')}>
      <span aria-label={$_('navbar.buttons.settings')} class={"dropbtn icon-cog"}
        on:click={() => dialog(Settings)} />
    </div>

</span>


  <div title={$_('sidemenu.toggle')} class="nav-button sidemenu">
    <span aria-label={$_('sidemenu.toggle')} class="dropbtn icon-menu"
      on:click={() => ($showSidemenu = !$showSidemenu)} />
  </div>
  {/if}
</nav>


<style>

  hr {
    padding: 0 !important;
    border: 0;
    height: 1px;
    background-color: #ccc !important;
  }

  nav {
    grid-area: navbar;
    display: flex;
    flex-direction: row;
    background-color: #333;
    color: #fff;
    user-select: none;
   /*padding-left: calc(5.5vw - 24px);*/ 
    box-sizing: border-box;
  }

  .content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    color: black;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 20000;
  }

  h1, .dropbtn, .content > * {
    display: block;
    padding: 0.9rem calc(0.8rem + 1.1vw);
    font-size: 1rem !important;
    margin: 0;
    font-weight: normal;
    cursor: pointer;
  }

  @media (max-width: 450px){
    h1, .dropbtn, .content > * {
      padding: 1rem 3.6vw;
      font-size: 10px;
    }

    .content { min-width: calc(40px + 24vw);}

  }

  /*@media (any-pointer: coarse) {
    h1, .dropbtn, .content > * {
      padding-top: 0.9rem;
      padding-bottom: 0.9rem;
    }
  }*/

  .nav-buttons {
    display: flex;
  }

  .sidemenu { display: none;}
  @media only screen and (max-width: 680px) {
    .sidemenu { display: block;}
    .nav-buttons.hidden{ display: none; }
    .nav-buttons {
      position: fixed;
      top: 1.8rem;
      left: 10px;
      flex-direction: column;
      z-index: 10000;
    }

    .nav-buttons > div {
      border-radius: 4px;
      background-color: #242424;
      border: solid 1px #eee;
      margin-bottom: 10px;
    }
  }

  .content > * {
    background-color: #f9f9f9;
    color: black;
    text-decoration: none;
  }

  :global(.mage-theme-dark nav .content){
    background-color: #3e3e3e !important;
  }

  :global(.mage-theme-dark nav .content > *){
    background-color: #242424 !important;
    color: #fff !important;
  } 

  :global(.mage-theme-dark nav .content > hr){
    background-color: #666 !important;
  } 
  
  :global(.mage-theme-dark nav .content > *:hover){
    background-color: #454545 !important;
  }

  nav div:hover h1, div:hover .dropbtn{
    background-color: #345b73;
  }

  .content > *:hover {
    background-color: #ddd;
  }

  div:hover .content{
    display: block;
  }


  input[type='file'] {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }

</style>


