<script>
  import { _ } from 'svelte-i18n'
	import { onMount } from 'svelte'
  import { book, chapter } from '../javascript/store.js'
  import {EditorState, EditorView, EditorSelection, defaultExtensions} from '../javascript/codemirror.js'
  import { ctrlShortcuts } from '../javascript/shortcuts.js'
  
  export let showSidemenu


  let textarea, editor
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
      {book.fullTitle($chapter.key)}
      <span class="group">{$chapter.value.group ? ` (${$chapter.value.group})` : ''}</span>
    </h1>
    <div on:click={addQuickLink} title={$_('editor.buttons.quicklink')}>
      <span class="link">#<span class="icon-flash"/></span>
    </div>
    <div on:click={addLink} title={$_('editor.buttons.link')}>#L</div>
  </div>  
  <div class="textarea" bind:this={textarea}>
    
  </div>
</main>

<style>

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
  }

  h1 {
    max-width: 380px;
    flex-grow: 1;
    padding: 1.2rem 0 0.8rem;
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
    background-color: #fff;
    overflow-y: auto;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
    padding-bottom: 22px;
  }

  @media only screen and (max-width: 680px) {
    span.group {
      display: none;
    }
  }
  
  @media (any-pointer: coarse) {
    h1 {
      padding: 1.3rem 0 1.1rem;
    }
  }


  :global(.editor *) {
    font-family: Arial, sans-serif;
    font-size: 20px;
    outline: none !important;
  }

  :global(.cm-scroller){
    padding-bottom: 25px;
  }

  .toolbar{
    padding-left: calc(6.5vw - 8px);
  }
  :global(.cm-line){
    padding: 7px calc(6.5vw - 10px) !important;
  }
</style>


