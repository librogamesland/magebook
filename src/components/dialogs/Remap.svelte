<script lang="ts">
  import { _ } from "svelte-i18n";
  import { tick } from "svelte";
  import { nullUntilLoaded } from '../../javascript/store'
  import { compactBook, shuffleBook, sortBook } from '../../javascript/book-utils'
  import { session } from '../../javascript/database.js'
  import { download } from '../../javascript/file.js'
  import { isFirebase } from '../../javascript/database.js'
  import { isVSCode } from '../../javascript/vscode'

  import fixed    from '../../assets/img/flags/fixed.png'
  import noexport from '../../assets/img/flags/noexport.png'
  import death    from '../../assets/img/flags/death.png'
  import final    from '../../assets/img/flags/final.png'

  let flagImgs : Record<string, string> = { fixed, noexport, death, final }

  $: ({book, editor} = $nullUntilLoaded)


  export let params;
  export let callback : Function;

  $: [type] = $params as [string]


  // Entity input binddings
  let groupFilter = "";
  let flags : Record<string, boolean> = {
    fixed : true,
    noexport: false,
    final : false,
    death : false,
  }

  let selectedGroup = 'allgroupidtag'
  $: groups = !book ? [] : [...Object.keys($book.index.chaptersWith.group)]

  $: {
    if(selectedGroup != 'allgroupidtag'){
      groupFilter += selectedGroup + ', '
      tick().then( () => {
        selectedGroup = 'allgroupidtag'
      })
    }
  }

  const remap = ()  => {
    const selectedFlags = Object.keys(flags).filter((key) => flags[key]);
    const groupsFilter = groupFilter.split(',').map( s => s.trim()).filter(s => s)

    const doRemap : Record<string, Function> = {
      shuffle: () => shuffleBook(book, {selectedFlags, groupsFilter}),
      sort:    () => sortBook(book, {selectedFlags, groupsFilter}),
      compact: () => compactBook(book, {selectedFlags, groupsFilter}),
    }

    const remapped = doRemap[type]()

    if($isFirebase || isVSCode || type !== 'shuffle'){
      book.set(remapped)
      callback(false)
      return
    }
    session.open({
      data: {
        book: remapped,
        cursor: {row: 0, column: 0},
        title: book.index.title
      }
    })
  }
</script>

<div class="dialog">
  <h3>{$_(`dialogs.remap.${type}.title`)}</h3>
  <p>{$_(`dialogs.remap.${type}.hint`)}</p>
  <h4>{$_("dialogs.remap.group")}:</h4>
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
  <h4>{$_("dialogs.remap.flags")}:</h4>
  <div class="flags">
    {#each ["fixed", "noexport", "final", "death"] as flag}
      <button
        class:selected={flags[flag]}
        on:click={() => (flags[flag] = !flags[flag])}
      >
        <img class="inline-block w-6 h-6 mx-auto" alt={flag} src={flagImgs[flag]}/>
    </button>
    {/each}
  </div>
  <button
    class="ok"
    on:click={remap}
  >
    {$_("dialogs.ok")}
  </button>
  <button class="cancel" on:click={() => download('md', book)}>{$_('dialogs.remap.savecopy')}</button>

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


  h4 {
    margin: 1.3rem 0 15px;
  }

  .input {
    width: 100%;
    display: flex;
    align-items: center;
  }

  .input > input {
    padding: 0.4rem 0.2rem;
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

  .flags > button {
    box-sizing: border-box;
    flex: 1 0 auto;
    text-align: center;
    height: 100%;
    justify-content: center;
  }
  @media (hover: hover) {
    .flags > button:hover {
      background-color: #ddd;
    }
  }

  .flags > button.selected {
    background-color: #8a8a8a;
  }
</style>
