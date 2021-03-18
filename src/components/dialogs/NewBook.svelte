<script>
  import { _ } from 'svelte-i18n'
  import { session } from '../../javascript/store.js'
  export let params
  export let callback

  // Entity input bindings
  let title, author


  const newBook = (title = "Book", author = "Magebook editor") => {
    session.open({
      file: {
        name: title,
      },
      data: {
        key: "1",
        properties: {
          title,
          author,
          revision: "0",
        },
        chapters: {
          "intro": {title:"Introduction", text:"", flags: []},
          "rules": {title:"Rules", text:"", flags: []},
          "1": {title:"", text:"", flags: []},
        }
      }
    })
  }

</script>
<div class="dialog">
  <h3>{$_('dialogs.newbook.new')}</h3>
  <div class="input">
    <span>{$_('dialogs.newbook.title')}</span>
    <input bind:value={title} type="text" />
  </div>
  <div class="input">
    <span>{$_('dialogs.newbook.author')}</span>
    <input bind:value={author} type="text" />
  </div>
  <p style="margin: 1rem 0">{@html $_('dialogs.newbook.hint')}</p>
  <button
    class="ok"
    on:click={() => newBook(title, author)}>
    {$_('dialogs.ok')}
  </button>
  <button class="cancel" on:click={() => callback(false)}>{$_('dialogs.cancel')}</button>
</div>


<style>
 
  .input {
    width: 100%;
    display: flex;
    align-items: center;
  }
  
  .input > input {
    height: 1rem;
    margin: 0.5rem 0;
    flex-grow: 1;
    flex-shrink: 1;
    min-width: 0;
  } 

  .input > span {
    min-width: calc(40px + 4vw);
  } 
</style>