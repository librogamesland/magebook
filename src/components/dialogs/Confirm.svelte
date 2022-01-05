<script>
  import {_} from 'svelte-i18n'
  import { newBook } from '../../javascript/new-book.js'
  import { download } from '../../javascript/file.js'


  export let params
  export let callback

  let title, text
  $: [title, text, saveCopy] = $params
</script>

<div class="dialog">
  <h3>{title}</h3>
  <p>{text}</p>
  <button class="ok" on:click={() => callback(true)}>{$_('dialogs.ok')}</button>
  {#if saveCopy}
  <button class="cancel" on:click={() => download('md', newBook.flush())}>{$_('dialogs.shuffle.savecopy')}</button>

  {/if}
  <button class="cancel" on:click={() => callback(false)}>{$_('dialogs.cancel')}</button>
</div>