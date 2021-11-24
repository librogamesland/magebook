<script>
  import { _ } from 'svelte-i18n'
	import { onMount, tick } from 'svelte'
  import { book, chapter } from '../javascript/store.js'
  import { bookIndex } from '../javascript/new-book.js'
  import { initEditor, getEditor, currentChapterKey, cursorPosition, currentChapterFullTitle } from '../javascript/editor'
//  import {EditorState, EditorView, EditorSelection, defaultExtensions} from '../javascript/codemirror.js'
  import { ctrlShortcuts } from '../javascript/shortcuts.js'

  
  
  export let showSidemenu


  let editor

  const fullTitle = (chapterKey) => {
    if(chapterKey == '') return ' '
    const chapter = $bookIndex.chapters.get(chapterKey)
    return chapterKey + (chapter.title ? ' - ' + chapter.title : '')
  }



  onMount(() => {
    initEditor("main-editor")
  })

  /*
  const extensions = defaultExtensions( (link) => {
    if(link.startsWith('#')){
      const key = link.substr(1) 
      // TODO: AGGIUNGERE MESSAGGIO DI ERRORE
      if(key != book.sanitizeKey(key)) return
      book.update(({chapters}) => {
        if(!chapters[key]) chapters[key] = book.newChapter()
        return {chapters, key}
      })
    }
  })

	onMount(() => {
    editor = new EditorView({
      state: EditorState.create({ doc: $chapter.value.text, extensions }),
      parent: textarea
    })
  })

  book.beforeUpdate( ({chapters, key}) => {
    if(editor){
      chapters[key].text = editor.state.doc.toString().replace(/[\n\s]+$/, "")
      return {chapters}
    }
  })

  $: { if(editor){
    const text = $chapter.value.text
      if( text !== editor.state.doc.toString()){
        editor.setState(EditorState.create({
        doc: text,
        extensions,
        selection: EditorSelection.range(text.length, text.length),
      }))
      editor.focus()
      editor.scrollDOM.scrollTo(0,0)
    }
  }}

  */

  const addLink = () => {
    editor.dispatch(editor.state.changeByRange(range => ({
      changes: [{from: range.from, insert: "[](#"}, {from: range.to, insert: ")"}],
      range: EditorSelection.range(range.from + 4, range.to +4),
      scrollIntoView: true,
    })))

    editor.focus()
  }

  

  const addQuickLink = () => {
    let key = book.availableKey()
    const quickLink = "[](#" + key + ")"

    let pos
    editor.dispatch(editor.state.changeByRange(range => {
      pos = range.from + quickLink.length - 1;
      return {
        changes: [{from: range.from, insert: quickLink}],
        range: EditorSelection.range(range.from + quickLink.length, range.from + quickLink.length),
      }
    }))

    book.update(({chapters}) => {
      chapters[key] = book.newChapter()
      return {chapters}
    })


    editor.focus()
    editor.scrollPosIntoView(pos)
  }

  ctrlShortcuts({
    'K': () => addQuickLink(),
    'L': () => addLink()
  })


</script>

<main class="editor">
  <div class="toolbar">
    <h1 on:click={ () => showSidemenu = !showSidemenu}>
      {$currentChapterFullTitle}
      <span class="group">{$chapter.value.group ? ` (${$chapter.value.group})` : ''}</span>
    </h1>
    <div class="only-desktop" on:click={async() => {
      getEditor().execCommand('find')
  }} title={$_('editor.buttons.link')}><span class="icon-search"/></div>
    <div class="only-desktop" on:click={addLink} title={$_('editor.buttons.link')}><span class="icon-ccw"/></div>
    <div class="only-desktop" on:click={addLink} title={$_('editor.buttons.link')}><span class="icon-cw"/></div>
    <div on:click={addQuickLink} title={$_('editor.buttons.quicklink')}>
      <span class="link">#<span class="icon-flash"/></span>
    </div>
    <div on:click={addLink} title={$_('editor.buttons.link')}>#L</div>
  </div>  
  <div class="textarea" id="main-editor">
    
  </div>
</main>

<style>
/*
  :global(.ace_mobile-menu) {
    display: none;
  } */


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
    grid-template-rows: auto 1fr;
    grid-gap: 1px;
    grid-template-areas: 
      "toolbar"
      "textarea";
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
    padding: 0.6rem 0 0.3rem;
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
    padding-bottom: 22px;
  }


  @media only screen and (max-width: 680px) {
    .only-desktop {
      display: none;
    }
    span.group {
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
</style>


