<script>
  import { _ } from "svelte-i18n";
  import { tick } from "svelte";
  import { Book } from '../../javascript/book.js'
  import md from '../../javascript/formats/md.js'
  import { newBook, bookIndex } from '../../javascript/new-book.js'
  import { session } from '../../javascript/database.js'
  import { download } from '../../javascript/file.js'
  import { isFirebase } from '../../javascript/database.js'
  import { isApp } from '../../javascript/appMode.js'
  import { getEditor } from '../../javascript/editor.js'
  export let params;
  export let callback;

  !params;

  // Entity input bindings
  let groupFilter = "";
  let flags = {
    final : false,
    fixed : false,
    death : false,
  }

  let selectedGroup = 'allgroupidtag'
  $: groups = [...$bookIndex.groups]

  $: {
    if(selectedGroup != 'allgroupidtag'){
      groupFilter += selectedGroup + ', '
      tick().then( () => {
        selectedGroup = 'allgroupidtag'
      })
    }
  }

  const shuffle = ()  => {
    const selectedFlags = Object.keys(flags).filter((key) => flags[key]);
    const filter = groupFilter.split(',').map( s => s.trim()).filter(s => s)

    const book = new Book(md.decode($newBook))

    const shuffled = md.encode(book.shuffle(selectedFlags, filter, true))

    if($isFirebase || $isApp){
      getEditor().setValue(shuffled, -1)
      callback(false)
      return
    }
    session.open({
      data: {
        book: shuffled,
        cursor: {row: 0, column: 0},
        title: $bookIndex.properties.title
      }
    })
  }
</script>

<div class="dialog">
  <h3>{$_("dialogs.shuffle.title")}</h3>
  <p>{$_("dialogs.shuffle.hint")}</p>  
  <h4>{$_("dialogs.shuffle.group")}:</h4>
  <div class="input">
    <input bind:value={groupFilter} type="text" />
    <span class="select-dropdown" style="margin-left:5px">
      <select bind:value={selectedGroup}>
        <option value="allgroupidtag">{$_('sidemenu.allgroup')}</option>
        {#each groups as group}
          <option value={group}>{group}</option>
        {/each}
      </select>
    </span>  
  </div>
  <h4>{$_("dialogs.shuffle.flags")}:</h4>
  <div class="flags">
    {#each ["final", "fixed", "death"] as flag}
      <div
        class:selected={flags[flag]}
        on:click={() => (flags[flag] = !flags[flag])}
      >
        <img alt={flag} src={`./static/img/flags/${flag}.png`} />
      </div>
    {/each}
  </div>
  <button
    class="ok"
    on:click={shuffle}
  >
    {$_("dialogs.ok")}
  </button>
  <button class="cancel" on:click={() => download('md', newBook.flush())}>{$_('dialogs.shuffle.savecopy')}</button>

  <button class="cancel" on:click={() => callback(false)}
    >{$_("dialogs.cancel")}</button
  >
</div>

<style>
  .dialog {
    max-width: 550px;
    margin-left: 20px;
    margin-right: 20px;
  }
  img {
    box-sizing: border-box;
    margin-top: calc((2.5rem - 20px) / 2);
  }

  h4 {
    margin: 1.3rem 0 15px;
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
    min-width: calc(40px + 4vw);
  }

  .flags {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 2.5rem;
    box-sizing: border-box;
    margin: 0.3rem 0 0.5rem;
    background-color: #f3f2f2;
    border: 1px solid #555;
  }

  .flags > div {
    box-sizing: border-box;
    flex: 1 0 auto;
    text-align: center;
    height: 100%;
    justify-content: center;
  }
  @media (hover: hover) {
    .flags > div:hover {
      background-color: #ddd;
    }
  }

  .flags > div.selected {
    background-color: #8a8a8a;
  }
</style>
