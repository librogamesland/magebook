<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { firstAvaiableKey, type EditableBook, chapterText, findNewKeyIndex, sanitizeKey, addChapter, deleteChapter, editChapter } from '../javascript/book-utils'
  import { historyCanGoBack, goBack, goToChapter} from '../javascript/navigator.js'
  import { ctrlShortcuts } from '../javascript/shortcuts.js'
  // Dialogs
  import { dialog } from './Dialogs.svelte'
  import Chapter    from './dialogs/Chapter.svelte'
  import Confirm    from './dialogs/Confirm.svelte'
  import { nullUntilLoaded, showSidemenu } from '../javascript/store';

  export let windowW: number;
  export let w : number;


  $: ({book, selectedChapter, selectedChapterIndex, editor} = $nullUntilLoaded)



  const add = async () => {
    const result = await dialog(
      Chapter,
      $_('dialogs.chapter.add'),
      firstAvaiableKey(book),
      {
        title: "",
        group: $selectedChapter?.group ?? '',
        flags:[],
        text: ""
      }
    )
    if(!result) return
    let { key, value } = result as any
    key = sanitizeKey(key)
    value.group = sanitizeKey(value.group || '')
    if (!key) return

    const [chapterIndex] = addChapter(book, {
      key,
      title: value.title ?? '',
      group: value.group,
      flags: value.flags ?? [],
    }, $selectedChapterIndex)
    goToChapter(chapterIndex)
  }

  const edit = async () => {
    if($selectedChapterIndex === -1) return
    const chapterIndex = $selectedChapterIndex
    const chapter = book.index.chapters[chapterIndex]
    const result = await dialog(
      Chapter,
      $_('dialogs.chapter.add'),
      chapter.key,
      {
        title: chapter.title,
        group: chapter.group,
        flags: chapter.flags,
        text: ""
      }
    )

    if(!result) return
    let { key, value } = result as any
    key = sanitizeKey(key)
    value.group = sanitizeKey(value.group || '')
    if (!key) return

    editChapter(book as EditableBook, chapterIndex, {
      key,
      title: value.title?? '',
      group: value.group,
      flags: value.flags?? [],
    }, $selectedChapterIndex)


    goToChapter(chapterIndex, false)

    $showSidemenu = false
  }


  const del = async () => {
    const chapterIndex = $selectedChapterIndex
    const key = $selectedChapter.key
    if(key == '') return
    if (await dialog(Confirm, $_('dialogs.confirm'), $_(`dialogs.chapter.delete`).replace("%1", key))) {
      deleteChapter(book, chapterIndex)
      $showSidemenu = false
      editor.focus()
    }
  }


  ctrlShortcuts({
    'R': () => add(),
    'E': () => edit(),
    'D': () => del(),
  })
</script>

{#if w > 200 || windowW < 680}
<div class="buttons">
  <button class="icon-back" on:click={goBack} title={$_('sidemenu.actions.goback')} disabled={!$historyCanGoBack} />
  <button class="icon-plus" on:click={add} title={$_('sidemenu.actions.add')} />
  <button class="icon-pencil" on:click={edit} title={$_('sidemenu.actions.edit')} disabled={$selectedChapterIndex === -1} />
  <button class="icon-trash" on:click={del} title={$_('sidemenu.actions.delete')} disabled={$selectedChapterIndex === -1} />
</div>
{:else}
<div class="buttons !border-b-0">
  <button class="icon-back !py-2" on:click={goBack} title={$_('sidemenu.actions.goback')} disabled={!$historyCanGoBack} />
  <button class="icon-plus !py-2" on:click={add} title={$_('sidemenu.actions.add')} />
</div>
<div class="buttons !border-t-0">
  <button class="icon-pencil !pt-0 !pb-2" on:click={edit} title={$_('sidemenu.actions.edit')}  disabled={$selectedChapterIndex === -1} />
  <button class="icon-trash  !pt-0 !pb-2" on:click={del} title={$_('sidemenu.actions.delete')} disabled={$selectedChapterIndex === -1} />
</div>
{/if}

<style>
  .buttons {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    border: 1px solid #666;
    border-bottom: none;
    background-color: #f1f1f1;
  }
  .buttons > button[disabled] {
    opacity: 0.3;
    pointer-events:none;
    cursor: not-allowed; /* nota: dovrei usare un wrapper, perché cursor not allowed non funziona quando pointer-events = none*/
  }
  .buttons > button {
    cursor: pointer;
    display: block;
    flex-grow: 1;
    text-align: center;
    box-sizing: border-box;
    padding: 0.7rem 0px;
    content: ' ';
    font-size: 1.3rem;
  }
  .buttons > button:hover {
    background-color: #ddd;
  }

  :global(.mage-theme-dark) .buttons{
    background-color: #000 !important;
  }
  :global(.mage-theme-dark aside) .buttons > button {
    border: 0 !important;
  }

  :global(.mage-theme-dark aside) .buttons > button:hover {
    background-color: #444 !important;
  }


</style>
