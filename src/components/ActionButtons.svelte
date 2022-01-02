<script>
  import { _ } from 'svelte-i18n'
  import { sanitizeKey, bookIndex, newBook} from '../javascript/new-book.js'
  import { currentChapterKey, getEditor, showSidemenu } from '../javascript/editor.js'
  import { firstAvaiableKey, addChapter, generateChapterText } from '../javascript/actions.js'
  import { historyCanGoBack, goBack, goToChapter} from '../javascript/navigator.js'
  import { ctrlShortcuts } from '../javascript/shortcuts.js'
  // Dialogs
  import { dialog } from './Dialogs.svelte'
  import Chapter    from './dialogs/Chapter.svelte'
  import Confirm    from './dialogs/Confirm.svelte'


  const add = async () => {
    const result = await dialog(
      Chapter,
      $_('dialogs.chapter.add'),
      firstAvaiableKey(),
      {
        title: "", 
        group: $currentChapterKey == '' ? '' : $bookIndex.chapters.get($currentChapterKey).group || '', 
        flags:[], 
        text: ""
      }
    )
    if(!result) return
    let { key, value } = result
    key = sanitizeKey(key)
    value.group = sanitizeKey(value.group || '')
    if (!key) return
    addChapter(key, generateChapterText({
      spacelines: 2,
      key,
      title: value.title || '',
      group: value.group,
      flags: value.flags || [],
    }))
    $showSidemenu = false
    newBook.flush()
    goToChapter(key)
  }
  const edit = async () => {
    const cKey = $currentChapterKey
    if(cKey == '') return
    const result = await dialog(
      Chapter,
      $_('dialogs.chapter.edit'),
      cKey,
      $bookIndex.chapters.get(cKey)
    )
    if(!result) return
    let { key, value } = result
    key = sanitizeKey(key)
    value.group = sanitizeKey(value.group || '')
    if (!key) return
    const chapter =  $bookIndex.chapters.get(cKey)
    const content = getEditor().session.doc.getTextRange(new ace.Range(chapter.contentStart + 1, 0, chapter.contentEnd + 1, 0))
      .split('\n').filter( line => !(line.includes('[group]:<>') || line.includes('![flag-'))).join('\n').trim()
    getEditor().session.replace(new ace.Range(chapter.start, 0, chapter.contentEnd + 1, 0), "");
    newBook.flush()
    addChapter(key, generateChapterText({
      spacelines: 2,
      key,
      title: value.title || '',
      group: value.group,
      flags: value.flags || [],
      content
    }))
    newBook.flush()
    goToChapter(key)
    $showSidemenu = false
  }


  const del = async () => {
    const key = $currentChapterKey
    if(key == '') return
    if (await dialog(Confirm, $_('dialogs.confirm'), $_(`dialogs.chapter.delete`).replace("%1", key))) {
      const chapter = $bookIndex.chapters.get(key)
      console.log("maigd", chapter)

      getEditor().session.replace(new ace.Range(chapter.start, 0, chapter.contentEnd + 1, 0), "");
      $showSidemenu = false
    }
  }


  ctrlShortcuts({
    'R': () => add(),
    'E': () => edit(),
    'D': () => del(),
  })
</script>

<div class="buttons">
  <div class="icon-back" on:click={goBack} title={$_('sidemenu.actions.goback')} disabled={!$historyCanGoBack} />
  <div class="icon-plus" on:click={add} title={$_('sidemenu.actions.add')} />
  <div class="icon-pencil" on:click={edit} title={$_('sidemenu.actions.edit')}  disabled={$currentChapterKey == ""} />
  <div class="icon-trash" on:click={del} title={$_('sidemenu.actions.delete')} disabled={$currentChapterKey == ""} />
</div>

<style>
  .buttons {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    border: 1px solid #666;
    border-bottom: none;
    background-color: #f1f1f1;
  }
  .buttons > div[disabled=true] {
    opacity: 0.3;
    pointer-events:none;
    cursor: not-allowed; /* nota: dovrei usare un wrapper, perché cursor not allowed non funziona quando pointer-events = none*/
  }
  .buttons > div {
    cursor: pointer;
    display: block;
    flex-grow: 1;
    text-align: center;
    box-sizing: border-box;
    padding: 0.7rem 11px;
    content: ' ';
    font-size: 1.3rem;
  }
  .buttons > div:hover {
    background-color: #ddd;
  }
</style>