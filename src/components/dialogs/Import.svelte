<script lang="ts">
    import { _ } from 'svelte-i18n'
  
    export let params
    export let callback
  
    !params;
</script>
  
  
  <div class="dialog">
    <h3>Import</h3>
    <div contenteditable="true"></div>
    <button class="ok" on:click={() => callback(true)}>{$_('dialogs.ok')}</button>
  </div>
  