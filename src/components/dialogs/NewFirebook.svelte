<script lang="ts">
  import { encode } from 'js-base64';
  import { _ } from 'svelte-i18n'
  export let params
  export let callback

  !params;


  // Entity input bindings
  let apiKey, databaseURL, book

  const loadNewBook = () => {

    const config = encodeURIComponent(encode(JSON.stringify({
        apiKey: apiKey.replaceAll('",', '').replaceAll('"', '').replaceAll('apiKey:', '').trim(),
        databaseURL: databaseURL.replaceAll('",', '').replaceAll('"', '').replaceAll('databaseURL:', '').trim(),
        book
      })))
    location.assign(`#fsession=${config}`)
    location.reload()
  }



</script>
<div class="dialog">
  <form method="post" action="/signin" on:submit|preventDefault>
  <h3>{$_('dialogs.newfirebook.new')}</h3>
  <div class="input">
    <span>apiKey:</span>
    <input bind:value={apiKey} name="password" type="password" />
  </div>
  <div class="input">
    <span>databaseURL:</span>
    <input bind:value={databaseURL} name="user" type="text" />
  </div>
  <div class="input">
    <span>{$_('dialogs.newfirebook.book')}:</span>
    <input bind:value={book} type="text" />
  </div>
  <p class="getstarted" style="margin: 1rem 0">{@html $_('dialogs.newfirebook.getStarted')}</p>

  <button
    disabled={!book || !apiKey || !databaseURL}
    class="ok"
    on:click={() => loadNewBook()}>{$_('dialogs.ok')}</button>
  <button class="cancel" on:click={() => callback(false)}>{$_('dialogs.cancel')}</button>
  </form>
</div>

<style>
  :global(.getstarted br) {
    line-height: 1rem;
    content: " ";
    display: block;
    margin: 10px;
  }

  .dialog {
    width: 550px;
    max-width: calc(100vw - 30px);
  }

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
    min-width: calc(75px + 4vw);
  } 
</style>