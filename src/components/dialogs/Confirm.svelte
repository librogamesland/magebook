<script lang="ts">
  import {_} from 'svelte-i18n'
  import { store } from '../../javascript/store'
  import { download } from '../../javascript/file.js'


  export let params
  export let callback

  let book = null
  store.then( r => ({book} = r))

  let title, text
  $: [title, text, saveCopy] = $params
</script>

<div class="dialog">
  <h3>{title}</h3>
  <p>{text}</p>
  <button class="ok" on:click={() => callback(true)}>{$_('dialogs.ok')}</button>
  {#if saveCopy}
  <button class="cancel" on:click={() => download('md', book)}>{$_('dialogs.shuffle.savecopy')}</button>

  {/if}
  <button class="cancel" on:click={() => callback(false)}>{$_('dialogs.cancel')}</button>
</div>