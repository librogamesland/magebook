<script>
  import {_} from 'svelte-i18n'

  export let params
  export let callback

  let title, text
  $: [title, text] = $params
</script>

<div class="dialog">
  <h3>{title}</h3>
  <p>{text}</p>
  <button class="ok" on:click={() => callback(true)}>{$_('dialogs.ok')}</button>
  <button class="cancel" on:click={() => callback(false)}>{$_('dialogs.cancel')}</button>
</div>