<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { firstAvaiableKey, generateChapterFullText, getRightOrderKey, sanitizeKey } from '../javascript/book-utils'
  import { historyCanGoBack, goBack, goToChapter} from '../javascript/navigator.js'
  import { ctrlShortcuts } from '../javascript/shortcuts.js'
  // Dialogs
  import { dialog } from './Dialogs.svelte'
  import Chapter    from './dialogs/Chapter.svelte'
  import Confirm    from './dialogs/Confirm.svelte'
  import { showSidemenu, store } from '../javascript/store';

  export let windowW;
  export let w;

  $: console.log("sdfv" + w)


  let book = null, currentChapterKey = null, currentChapterFullTitle = null, editor = null
  store.then( r => ({book, currentChapterKey, currentChapterFullTitle, editor} = r))


  const addChapter = (key, text) => {

    const index = editor.state.doc.line(getRightOrderKey(book, key, currentChapterKey) + 1).to
    editor.dispatch({
      changes: { from: index, to: index, insert: '\n' + text },
    })

  }

 
  const add = async () => {
    const result = await dialog(
      Chapter,
      $_('dialogs.chapter.add'),
      firstAvaiableKey(book),
      {
        title: "", 
        group: $currentChapterKey == '' ? '' : book.index.chapters.get($currentChapterKey).group || '', 
        flags:[], 
        text: ""
      }
    )
    if(!result) return
    let { key, value } = result
    key = sanitizeKey(key)
    value.group = sanitizeKey(value.group || '')
    if (!key) return
    addChapter(key, generateChapterFullText({
      beforeSpaceLines: 2,
      key,
      title: value.title || '',
      group: value.group,
      flags: value.flags || [],
    }))
    $showSidemenu = false
    goToChapter(key)
  }

  const edit = async () => {
    
    const cKey = $currentChapterKey
    if(cKey == '') return
    const result = await dialog(
      Chapter,
      $_('dialogs.chapter.edit'),
      cKey,
      book.index.chapters.get(cKey)
    )
    if(!result) return
    let { key, value } = result
    key = sanitizeKey(key)
    value.group = sanitizeKey(value.group || '')
    if (!key) return

    if(key !== cKey){
      let text = $book.replace(/\[([^\[]*)\](\(\s*#(\w+)\s*\))/g, (...all) => `[${all[1]}](#${
        all[3] === cKey ? key  : all[3]
      })`)

      if(!book.index.properties['disableShortLinks'] || book.index.properties['disableShortLinks'] !== 'true'){
        text = text.replace(/\[([^\[]*)\](?!\()/g, (...all) => `[${all[1] === cKey ? key  : all[1]}]`)
      }

      editor.dispatch({
        changes: {from: 0, to: editor.state.doc.length, insert: text}
      })


    }

    // Get old content
    const chapter =  book.index.chapters.get(cKey)

    const content = editor.state.sliceDoc(
        editor.state.doc.line(chapter.contentStart + 2).from,
        editor.state.doc.line(chapter.contentEnd + 2 ).to
      ).split('\n').filter( line => !(line.includes('[group]:<>') || line.includes('![flag-') || line.includes('![][flag-'))).join('\n').trim()
    
    // Delete chapter
    const start = editor.state.doc.line(chapter.start ).to
    const end = editor.state.doc.line(chapter.contentEnd + 1).to
    editor.dispatch({
      changes: { from: start, to: end, insert: '' },
    })

    


    addChapter(key, generateChapterFullText({
      beforeSpaceLines: 2,
      key,
      title: value.title || '',
      group: value.group,
      flags: value.flags || [],
      text: content
    }))
    goToChapter(key)

    $showSidemenu = false
  }


  const del = async () => {
    const key = $currentChapterKey
    if(key == '') return
    if (await dialog(Confirm, $_('dialogs.confirm'), $_(`dialogs.chapter.delete`).replace("%1", key))) {
      const chapter = book.index.chapters.get(key)
      const start = editor.state.doc.line(chapter.start ).to
      const end = editor.state.doc.line(chapter.contentEnd + 1).to


      editor.dispatch({
        changes: { from: start, to: end, insert: '' },
      })

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
  <div class="icon-back" on:click={goBack} title={$_('sidemenu.actions.goback')} disabled={!$historyCanGoBack} />
  <div class="icon-plus" on:click={add} title={$_('sidemenu.actions.add')} />
  <div class="icon-pencil" on:click={edit} title={$_('sidemenu.actions.edit')}  disabled={$currentChapterKey == ""} />
  <div class="icon-trash" on:click={del} title={$_('sidemenu.actions.delete')} disabled={$currentChapterKey == ""} />
</div>
{:else}
<div class="buttons !border-b-0">
  <div class="icon-back !py-2" on:click={goBack} title={$_('sidemenu.actions.goback')} disabled={!$historyCanGoBack} />
  <div class="icon-plus !py-2" on:click={add} title={$_('sidemenu.actions.add')} />
</div>
<div class="buttons !border-t-0">
  <div class="icon-pencil !pt-0 !pb-2" on:click={edit} title={$_('sidemenu.actions.edit')}  disabled={$currentChapterKey == ""} />
  <div class="icon-trash  !pt-0 !pb-2" on:click={del} title={$_('sidemenu.actions.delete')} disabled={$currentChapterKey == ""} />
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
    padding: 0.7rem 0px;
    content: ' ';
    font-size: 1.3rem;
  }
  .buttons > div:hover {
    background-color: #ddd;
  }

  :global(.mage-theme-dark .buttons){
    background-color: #121423 !important;
  }
  :global(.mage-theme-dark aside .buttons > div:hover ){
    background-color: #444 !important;
  } 
</style>