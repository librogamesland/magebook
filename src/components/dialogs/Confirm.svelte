<script lang="ts">
  import {_} from 'svelte-i18n'
  import { nullUntilLoaded } from '../../javascript/store'
  import { download } from '../../javascript/file.js'


  export let params: any
  export let callback: any

  $: ({ book } =  $nullUntilLoaded)


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