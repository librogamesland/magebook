<script lang="ts">
  import { _ } from "svelte-i18n";
  import { ctrlShortcuts } from "../javascript/shortcuts.js";
  import { graphToImg } from "../javascript/graph.js";
  import { open, download } from "../javascript/file.js";
  import { book, isLoaded } from "../javascript/new-book.js";
  import { sortBook, compactBook } from "../javascript/book-utils";
  import { s } from "../javascript/settings";

  import { getEditor, showSidemenu } from "../javascript/editor.js";
  import { isVSCode } from "../javascript/vscode.js";

  // Dialogs
  import { dialog } from "./Dialogs.svelte";
  import About from "./dialogs/About.svelte";
  import Confirm from "./dialogs/Confirm.svelte";
  import Img from "./dialogs/Img.svelte";
  import Shuffle from "./dialogs/Shuffle.svelte";
  import NewBook from "./dialogs/NewBook.svelte";
  import NewFirebook from "./dialogs/NewFirebook.svelte";
  import Recover from "./dialogs/Recover.svelte";
  import Settings from "./dialogs/Settings.svelte";
  import Import from "./dialogs/Import.svelte";
  import EditorButtons from "./EditorButtons.svelte";

  const { theme } = s;

  if (!isVSCode) {
    ctrlShortcuts({
      S: () => download("md", book.flush()),
      O: () => document.getElementById("open").click(),
    });
  }

  let fullscreen = window.document.fullscreenElement ? true : false;

  document.onfullscreenchange = () => {
    fullscreen = window.document.fullscreenElement ? true : false;
  };
</script>

<nav class={`select-none flex flex-row box-border text-white bg-zinc-800 ${$showSidemenu ? "display" : "display"}`}
  style="grid-area: navbar;">
  {#if !isVSCode}
    <div>
      <h1 class="nav-element">{$_("navbar.file.title")}</h1>
      <div class="content">
        <p on:click={() => dialog(NewBook)}>{$_("navbar.file.new")}</p>
        <hr />
        <p on:click={() => dialog(NewFirebook)}>{$_("navbar.file.newFire")}</p>
        <hr />
        <input
          type="file"
          name="open"
          id="open"
          accept=".xlgc,.md, .magebook"
          on:change={(e) => open(e.target)}
        />
        <label for="open">{$_("navbar.file.open")} </label>
        <!-- <p on:click={() => dialog(Import)}>{$_('navbar.file.import')}</p> -->
        <p on:click={() => download("md", book.flush())}>
          {$_("navbar.file.save")}
        </p>
        <p on:click={() => dialog(Recover)}>{$_("navbar.file.recover")}</p>
      </div>
    </div>
  {/if}

  {#if $isLoaded}
    <div>
      <h1 class="nav-element">{$_("navbar.book.title")}</h1>
      <div class="content">
        <p on:click={() => dialog(Img, () => graphToImg(book.flush()))}>
          {$_("navbar.book.graph")}
        </p>
        <p on:click={() => dialog(Shuffle)}>{$_("navbar.book.shuffle")}</p>
        <p
          on:click={async () => {
            if (
              await dialog(
                Confirm,
                $_("dialogs.confirm"),
                $_("dialogs.chapter.sort"),
                true
              )
            )
              getEditor().dispatch({
                changes: {
                  from: 0,
                  to: getEditor().state.doc.length,
                  insert: sortBook($book),
                },
              });
          }}
        >
          {$_("navbar.book.sort")}
        </p>
        <p
          on:click={async () => {
            if (
              await dialog(
                Confirm,
                $_("dialogs.confirm"),
                $_("dialogs.chapter.compact"),
                true
              )
            )
              getEditor().dispatch({
                changes: {
                  from: 0,
                  to: getEditor().state.doc.length,
                  insert: compactBook($book),
                },
              });
          }}
        >
          {$_("navbar.book.compact")}
        </p>

        {#if isVSCode}
          <!--<hr>
      <p on:click={() => dialog(NewFirebook)}>{$_('navbar.file.newFire')}</p>   
      -->
        {/if}
      </div>
    </div>

    <div>
      <h1 class="nav-element">{$_("navbar.export.title")}</h1>
      <div class="content">
        <p on:click={() => download("docx", book.flush())}>
          {$_("navbar.export.docx")}
        </p>
        <p on:click={() => download("fodt", book.flush())}>
          {$_("navbar.export.fodt")}
        </p>
        <p on:click={() => download("html", book.flush())}>
          {$_("navbar.export.html")}
        </p>
        <p on:click={() => download("advanced", book.flush())}>
          {$_("navbar.export.advanced")}
        </p>
        <p on:click={() => download("xlgc", book.flush())}>
          {$_("navbar.export.xlgc")}
        </p>
        <hr />
        <a
          href={$_("navbar.export.otherslink")}
          target="_blank"
          rel="noreferrer">{$_("navbar.export.others")}</a
        >
        <hr />
        <a
          href={$_("navbar.export.settingslink")}
          target="_blank"
          rel="noreferrer">{$_("navbar.export.settings")}</a
        >
      </div>
    </div>
  {/if}

  <!-- Help -->
  <div>
    <h1 class="nav-element">{$_("navbar.help.title")}</h1>
    <div class="content">
      <a target="_blank" rel="noreferrer" href={$_("navbar.help.guidefile")}>
        {$_("navbar.help.guide")}
      </a>
      <a
        target="_blank"
        rel="noreferrer"
        href="https://www.librogame.net/index.php/forum/topic?id=5182&p=1#p148583"
      >
        {$_("navbar.help.forum")}
      </a>
      <a
        target="_blank"
        rel="noreferrer"
        href="https://docs.google.com/document/d/1BlAlzgdoFxTNodg501R4kDVG0I7JeBJjPuJsMSP47sg/edit?usp=sharing"
      >
        {$_("navbar.help.report")}
      </a>
      <p on:click={() => dialog(About)}>{$_("navbar.help.about")}</p>
    </div>
  </div>

  {#if $isLoaded}
    {#if isVSCode}
      <div class="margin" />
      <EditorButtons />
    {/if}

    <div class="flex-grow-1 w-full" />
    <span class={"nav-buttons " + ($showSidemenu ? "buttons-display" : "buttons-hidden")}>
      {#if !isVSCode}
        <div title={$_("navbar.buttons.fullscreen")}>
          <span
            aria-label={$_("navbar.buttons.fullscreen")}
            class={"dropbtn " +
              (fullscreen ? "icon-resize-small" : "icon-resize-full")}
            on:click={() => {
              if (window.document.fullscreenElement) {
                window.document.exitFullscreen();
              } else {
                window.document.body.requestFullscreen();
              }
            }}
          />
        </div>
      {/if}

      <div title={$_("navbar.buttons.darktheme")}>
        <span
          aria-label={$_("navbar.buttons.darktheme")}
          class={"dropbtn " + ($theme == "light" ? "icon-moon" : "icon-sun")}
          on:click={() => ($theme = $theme == "light" ? "dark" : "light")}
        />
      </div>

      <div title={$_("navbar.buttons.settings")}>
        <span
          aria-label={$_("navbar.buttons.settings")}
          class={"dropbtn icon-cog"}
          on:click={() => dialog(Settings)}
        />
      </div>
    </span>

    <div title={$_("sidemenu.toggle")} class="nav-button sidemenu">
      <span
        aria-label={$_("sidemenu.toggle")}
        class="dropbtn icon-menu"
        on:click={() => ($showSidemenu = !$showSidemenu)}
      />
    </div>
  {/if}
</nav>

<style lang="postcss">
  hr {
    @apply border-0 h-[1px] !p-0 !bg-gray-300;
  }

  :global(.vscode) nav {
    background-color: var(--vscode-breadcrumb-background);
    color: var(--vscode-breadcrumb-focusForeground);
  }

  :global(.vscode) nav {
    box-shadow: 0 4px 10px rgb(0 0 0 / 10%);
    z-index: 100;
  }

  .content {
    @apply hidden absolute min-w-[160px] shadow-md z-[200];
  }

  nav :global(.nav-element),
  .dropbtn,
  .content > * {
    display: block;
    padding: 0.9rem calc(0.8rem + 1.1vw);
    font-size: 1rem !important;
    margin: 0;
    font-weight: normal;
    cursor: pointer;
  }

  :global(.vscode) nav :global(.nav-element),
  :global(.vscode) .dropbtn,
  :global(.vscode) .content > * {
    padding: 0.7rem calc(0.7rem + 0.7vw);
  }

  @media (max-width: 450px) {
    nav :global(.nav-element),
    .dropbtn,
    .content > * {
      padding: 1rem 3.6vw;
      font-size: 10px;
    }

    .content {
      min-width: calc(40px + 24vw);
    }
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

  .sidemenu {
    display: none;
  }
  @media only screen and (max-width: 680px) {
    nav.display {
      z-index: auto;
    }
    .sidemenu {
      display: block;
    }

    .nav-buttons {
      position: fixed;
      top: 1.8rem;
      left: 10px;
      flex-direction: column;
      z-index: 10000;
      display: none;
      visibility: hidden;
    }

    .nav-buttons.buttons-display {
      display: flex;
      visibility: visible;
    }

    .nav-buttons > div {
      border-radius: 4px;
      background-color: var(--vscode-breadcrumb-background, #242424);
      opacity: 90%;
      border: solid 1px #eee;
      margin-bottom: 10px;
    }
  }

  .content,
  .content > * {
    background-color: var(--vscode-breadcrumb-background, #f9f9f9);
    color: var(--vscode-breadcrumb-focusForeground, black);
    text-decoration: none;
  }

  :global(.mage-theme-dark nav .content) {
    background-color: var(--vscode-breadcrumb-background, #3e3e3e) !important;
  }

  :global(.mage-theme-dark nav .content > *) {
    background-color: var(--vscode-breadcrumb-background, #242424) !important;
    color: var(--vscode-breadcrumb-focusForeground, #fff) !important;
  }

  :global(.mage-theme-dark nav .content > hr) {
    background-color: #666 !important;
  }

  :global(.mage-theme-dark nav .content > *:hover) {
    background-color: #454545 !important;
  }

  :global(.vscode-dark nav .content > *:hover) {
    background-color: #454545 !important;
  }

  :global(.vscode-light nav .content > *:hover) {
    background-color: #ddd !important;
  }

  nav div:hover :global(.nav-element),
  nav > :global(.nav-element):hover,
  div:hover .dropbtn {
    background-color: var(--vscode-statusBar-background, #345b73);
    color: var(--vscode-statusBar-foreground);
  }

  .content > *:hover {
    background-color: #ddd;
  }

  div:hover .content {
    display: block;
  }

  input[type="file"] {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }
</style>
