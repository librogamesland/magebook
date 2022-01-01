<script>
  import { _ } from 'svelte-i18n'
  import { session } from '../../javascript/database.js'
  export let params
  export let callback

  !params;

  const newBook = () => session.open({
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
    on:click={() => newBook()}>
    {$_('dialogs.ok')}
  </button>
  <button class="cancel" on:click={() => callback(false)}>{$_('dialogs.cancel')}</button>
</div>
