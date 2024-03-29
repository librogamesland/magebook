<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { onDestroy } from 'svelte'
  import { sanitizeKey } from '../../javascript/book-utils'
  import { nullUntilLoaded } from '../../javascript/store'

  import fixed    from '../../assets/img/flags/fixed.png'
  import death    from '../../assets/img/flags/death.png'
  import final    from '../../assets/img/flags/final.png'
  import noexport from '../../assets/img/flags/noexport.png'


  $: ({book} = $nullUntilLoaded)


  let flagImgs: Record<string, string> = { fixed, noexport, death, final }

  export let params : any
  export let callback : any




  // Entity input bindings
  let dialogTitle : string
  let key : string
  let value: any
  let title: string
  let flags : Record<string, boolean>
  let group: string
  let originalKey : string
  let genericFlags : string
  const filterFlags = () =>  Object.keys(flags).filter(key => flags[key]).concat(genericFlags.split('\n').map(el => el.trim()).filter(el => el.length > 0))

  const unsubscribe = params.subscribe( (p : any) => {
    ;([dialogTitle, key, value] = p)
    originalKey = key
    ;({ title = '', group = '' } = value)
    const flagProps : string[] = value.flags || []

    flags = {
      fixed:    flagProps.includes('fixed'),
      noexport: flagProps.includes('noexport'),
      final:    flagProps.includes('final'),
      death:    flagProps.includes('death'),
    }

    genericFlags = flagProps.filter(el => !Object.keys(flagImgs).includes(el)).join('\n')
  })

  onDestroy(unsubscribe)
  $: keyDuplicate = ((key !== originalKey) && book && $book.index.keys[key]) ? true : false
  $: keyIsValid = key === sanitizeKey(key)
  $: groupIsValid = group === sanitizeKey(group)
</script>
<div class="dialog">



  <h3>{dialogTitle}</h3>
  <div class="input">
    <span>{$_('dialogs.chapter.name')}</span>
    <input class:error={keyDuplicate || !keyIsValid} bind:value={key} type="text" />
  </div>
  <div class="input">
    <span>{$_('dialogs.chapter.title')}</span>
    <input bind:value={title} type="text" />
  </div>
  <div class="input">
    <span>{$_('dialogs.chapter.group')}</span>
    <input class:error={!groupIsValid} bind:value={group} type="text" list="chapters-groups" />
    <datalist id="chapters-groups">
      {#if book}
      {#each Object.keys($book.index.chaptersWith.group) as group}
        <option value={group}>{group}</option>
      {/each}
      {/if}
    </datalist>

  </div>
  <div class="flags">
    {#each ['fixed', 'noexport', 'final', 'death'] as flag}
      <button
        class:selected={flags[flag]}
        on:click={() => (flags[flag] = !flags[flag])}>
        <img class="inline-block w-6 h-6 mx-auto" alt={flag} src={flagImgs[flag]}/>
      </button>
    {/each}
  </div>
  <div class="flags-generic">
    <textarea placeholder={$_('dialogs.chapter.genericFlags')} bind:value={genericFlags}></textarea>
  </div>
  <p style="font-size: 85%" class:hide={!keyDuplicate}><i class="icon-warning"></i>{$_('dialogs.chapter.warnings.duplicate')}</p>
  <p style="font-size: 85%" class:hide={keyIsValid}><i class="icon-warning"></i>{$_('dialogs.chapter.warnings.invalidkey')}</p>
  <p style="font-size: 85%" class:hide={groupIsValid}><i class="icon-warning"></i>{$_('dialogs.chapter.warnings.invalidgroup')}</p>

  <button
    disabled={(keyDuplicate || !keyIsValid || !groupIsValid) ? true : false}
    class="ok"
    on:click={() => callback({
        key,
        value: { ...value, title, group, flags: filterFlags() },
      })}>
    {$_('dialogs.ok')}
  </button>
  <button class="cancel" on:click={() => callback(false)}>{$_('dialogs.cancel')}</button>
</div>


<style>

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

  .flags-generic {
    width: 100%;
  }

  .flags-generic > textarea {
    width: 100%;
    height: 100px;
    box-sizing: border-box;
    padding: 5px;
  }


  .flags > button.selected {
    background-color: #8a8a8a;
  }

  :global(.mage-theme-dark .dialog .flags > button ){
    background-color: #161616;
  }

  @media (hover: hover) {
    :global(.mage-theme-dark .dialog .flags > button:hover ){
      background-color: #565656;
    }
  }

  :global(.mage-theme-dark .dialog .flags > button.selected ){
    background-color: #2b356b;
  }

  .input input.error{
    background-color: #9e0000 !important;
    color: #fff !important;
  }

  .icon-warning {
    padding-right: 5px;
  }

  p.hide {
    opacity: 0.01;
    height: 0px;
    margin: 0px;
    padding: 0px;
  }

  @media only screen and (max-width: 600px) {
    .dialog {
      width: 100%;
    }
    p.hide {
      display: none;
    }
  }
</style>
