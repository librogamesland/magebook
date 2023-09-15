<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { session } from '../../javascript/database.js'
  export let params
  export let callback : (confirm : boolean) => any

  !params;

  const loadEmptyBook = () => session.open({
      data: {
        book: $_('books.local'),
        cursor: {row: 0, column: 0},
      }
    })

</script>
<div class="dialog">
  <h3>{$_('dialogs.newbook.new')}</h3>
  <p style="margin: 1rem 0">{@html $_('dialogs.newbook.hint')}</p>
  <button
    class="ok"
    on:click={() => loadEmptyBook()}>
    {$_('dialogs.ok')}
  </button>
  <button class="cancel" on:click={() => callback(false)}>{$_('dialogs.cancel')}</button>
</div>
