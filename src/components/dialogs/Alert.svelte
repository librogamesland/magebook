<script lang="ts">
  import { _ } from 'svelte-i18n'

  export let params : any
  export let callback : any

  let title : string, text : string
  $: [title, text] = $params
</script>


<div class="dialog">
  <h3>{title}</h3>
  <p>{@html text}</p>
  <button class="ok" on:click={() => callback(true)}>{$_('dialogs.ok')}</button>
</div>
