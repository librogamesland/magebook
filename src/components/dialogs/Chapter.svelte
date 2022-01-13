<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { onDestroy } from 'svelte'
  export let params
  export let callback

  // Entity input bindings
  let dialogTitle, key, value, title, flags, group
  const filterFlags = () => Object.keys(flags).filter(key => flags[key])

  const unsubscribe = params.subscribe( p => {
    ;([dialogTitle, key, value] = p)
    ;({ title = '', group = '' } = value)
    const flagProps = value.flags || []
    flags = {
      final: flagProps.includes('final'),
      fixed: flagProps.includes('fixed'),
      death: flagProps.includes('death'),
    }
  })

  onDestroy(unsubscribe)
</script>
<div class="dialog">
  <h3>{dialogTitle}</h3>
  <div class="input">
    <span>{$_('dialogs.chapter.name')}</span>
    <input bind:value={key} type="text" />
  </div>
  <div class="input">
    <span>{$_('dialogs.chapter.title')}</span>
    <input bind:value={title} type="text" />
  </div>
  <div class="input">
    <span>{$_('dialogs.chapter.group')}</span>
    <input bind:value={group} type="text" />
  </div>
  <div class="flags">
    {#each ['final', 'fixed', 'death'] as flag}
      <div
        class:selected={flags[flag]}
        on:click={() => (flags[flag] = !flags[flag])}>
        <img alt={flag} src={`./static/img/flags/${flag}.png`} />
      </div>
    {/each}
  </div>
  <p style="font-size: 85%">{$_('dialogs.chapter.hint')}</p>
  <button
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
  img {
    box-sizing: border-box;
    margin-top: calc((2.5rem - 20px) / 2);
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