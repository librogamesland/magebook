<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { ctrlShortcuts } from '../javascript/shortcuts.js'
  import { graphToImg } from '../javascript/graph.js'
  import { open, download } from '../javascript/file.js'
  import { newBook, isLoaded } from '../javascript/new-book.js'
  import { sortBook, compactBook} from '../javascript/book-utils'

  import { getEditor, showSidemenu } from '../javascript/editor.js'

  import { isApp, appReload }   from '../javascript/appMode.js'



  // Dialogs
  import { dialog }     from './Dialogs.svelte'
  import About          from './dialogs/About.svelte'
  import Confirm        from './dialogs/Confirm.svelte'
  import Img            from './dialogs/Img.svelte'
  import Shuffle        from './dialogs/Shuffle.svelte'
  import NewBook        from './dialogs/NewBook.svelte'
  import NewFirebook    from './dialogs/NewFirebook.svelte'
  import Recover        from './dialogs/Recover.svelte'




  ctrlShortcuts({
    'S': () => download('md', newBook.flush()),
    'O': () => document.getElementById('open').click()
  })

 
</script>


<nav>
  <div>
    <h1>{$_('navbar.file.title')}</h1>
    <div class="content">
      {#if $isApp}
        <p on:click={appReload}>{$_('app.chooseother')}</p>
        <p on:click={() => download('md', newBook.flush())}>{$_('dialogs.shuffle.savecopy')}</p>
      {:else}
        <p on:click={() => dialog(NewBook)}>{$_('navbar.file.new')}</p>
        <hr>
        <p on:click={() => dialog(NewFirebook)}>{$_('navbar.file.newFire')}</p>
        <hr>
        <input type="file" name="open" id="open"
          accept=".xlgc,.md"
          on:change={e => open(e.target )} />
        <label for="open">{$_("navbar.file.open")} </label>
        <p on:click={() => download('md', newBook.flush())}>{$_('navbar.file.save')}</p>
        <p on:click={() => dialog(Recover)}>{$_('navbar.file.recover')}</p>
      {/if}
    </div>
  </div>
  {#if $isLoaded}
  <div>
    <h1>{$_('navbar.book.title')}</h1>
    <div class="content">
      <p on:click={() => dialog(Img, () => graphToImg(newBook.flush()))}>{$_('navbar.book.graph')}</p>
      <p on:click={() => dialog(Shuffle)}>{$_('navbar.book.shuffle')}</p>
      <p on:click={async() => {
        if(await(dialog(Confirm, $_('dialogs.confirm'), $_('dialogs.chapter.sort'), true)))  getEditor().setValue(sortBook($newBook), -1) 
      }}>{$_('navbar.book.sort')}</p>
      <p on:click={async() => {
        if(await(dialog(Confirm, $_('dialogs.confirm'), $_('dialogs.chapter.compact'), true)))  getEditor().setValue(compactBook($newBook), -1) 
      }}>{$_('navbar.book.compact')}</p>
      </div>
  </div>

  <div>
    <h1>{$_('navbar.export.title')}</h1>
    <div class="content">
      <p on:click={() => download('docx', newBook.flush())}>{$_('navbar.export.docx')}</p>
      <p on:click={() => download('fodt', newBook.flush())}>{$_('navbar.export.fodt')}</p>
      <p on:click={() => download('xlgc', newBook.flush())}>{$_('navbar.export.xlgc')}</p>
      <!-- <p>{$_('navbar.export.vuejs')}</p> -->
    </div>
  </div>
  {/if}

  <!-- Help -->
  <div>
    <h1>{$_('navbar.help.title')}</h1>
    <div class="content">
      <a href={$_('navbar.help.guidefile')} target="_blank" rel="noopener">
        {$_('navbar.help.guide')}
      </a>
      <a href="https://www.librogame.net/index.php/forum/topic?id=5182&p=1#p148583" target="_blank" rel="noopener">
        {$_('navbar.help.forum')}
      </a>
      <p on:click={() => dialog(About)}>{$_('navbar.help.about')}</p>
    </div>
  </div>

  {#if $isLoaded}
  <div class="sidemenu-button">
    <span aria-label={$_('sidemenu.toggle')} class="dropbtn icon-menu"
      on:click={() => ($showSidemenu = !$showSidemenu)} />
  </div>
  {/if}
</nav>


<style>

  hr {
    padding: 0 !important;
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


  .dropbtn { display: none;}
  @media only screen and (max-width: 680px) {
    .dropbtn { display: block;}
  }

  .content > * {
    background-color: #f9f9f9;
    color: black;
    text-decoration: none;
  }

  div:hover h1, div:hover .dropbtn{
    background-color: #345b73;
  }

  .content > *:hover {
    background-color: #ddd;
  }

  div:hover .content{
    display: block;
  }


  .sidemenu-button {
    margin-left: auto;
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


