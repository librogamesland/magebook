<script context="module" lang="ts">
  import { writable } from 'svelte/store'


  const dialogStore = writable({})
  const lockStore   = writable({
    lock: false,
    session: null,
  })
  const dialog = (component : ComponentType<SvelteComponent<any>>, ...params : any[]) =>
    new Promise((resolve) =>
      dialogStore.set({
        component,
        callback(...args : any[]) {
          dialogStore.set({})
          // @ts-ignore
          resolve(...args)
        },
        params: writable(params),
      })
    )
  export { dialog, dialogStore, lockStore }
</script>

<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { tick, type ComponentType, SvelteComponent } from 'svelte'


  /* Dialog component */
  let lock = false, session :any, component : ComponentType<SvelteComponent<any>>, callback : Function, params : any[]

  lockStore.subscribe (data => ({lock, session} = data) )

  dialogStore.subscribe( async(data : any) => {
    // Retrieve basic info
    ;({ component, callback, params } = data)


    await tick();

    const button = document.querySelector('button.ok') as HTMLButtonElement | null
    if(button) button.focus()
  })
</script>

{#if lock}
  <div class="dialog-mask"/>
  <div class="dialog-container" role="dialog">
    <div class="dialog lock">
      <h3>{$_('dialogs.lock.title')}</h3>
      <p>{@html $_('dialogs.lock.text')}</p>
      <button class="ok" on:click={() => session.duplicate()}>{$_('dialogs.lock.new')}</button>
      <button class="error" on:click={() => session.lock()}>{$_('dialogs.lock.overwrite')}</button>
    </div>
  </div>
{/if}

{#if component}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="dialog-mask" on:click|self={() => callback(false)}/>
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div id="mage-modal" class="dialog-container" tabindex="-1" aria-modal="true" role="dialog" on:click|self={() => callback(false)}>
    <svelte:component this={component} {params} {callback}/>
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <span tabindex="0" aria-hidden="true" on:focus={() => document.getElementById('mage-modal')?.focus()}></span>
  </div>
{/if}


<style type="postcss">


  :global(.dialog-mask) {
    display: block;
    z-index: 100000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #000;
    opacity: 0.5;
  }

  :global(.dialog-container) {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: transparent;
  }

  :global(.dialog-container > .dialog) {
    padding: 0.6rem 2rem 1.3rem 2rem;
    border-radius: 6px;
    box-sizing: border-box;
    min-height: 200px;
    max-width: calc(100vw - 30px);
    background-color: #fff;
    opacity: 1;
    margin-bottom: 3vh;
    margin-left: 12px;
    margin-right: 12px;
  }

  @media (max-height: 450px){
    :global(.dialog-container > .dialog) {
      padding: 0.4rem 1.5rem 0.8rem 1.5rem;
      border-radius: 6px;
      box-sizing: border-box;
      min-height: 150px;
      max-width: calc(100vw - 30px);
      opacity: 1;
      margin-bottom: calc(10px + 4vh);
      max-height: calc(100vh - 30px);
      overflow-y: auto;
    }
  }

  :global(.dialog-container h3) {
    @apply text-2xl font-bold pt-4 pb-2;
  }

  :global(.dialog-container button.ok, .dialog-container input[type=submit].ok, .dialog-container button.cancel, .dialog-container button.error) {
    border: 0;
    box-sizing: border-box;
    height: 2.5rem;
    font-size: 1rem;
    padding: 0 1.5rem;
    margin: 0.5rem 0.6rem;
    margin-left: 0;
    border-radius: 4px;
    cursor: pointer;
  }

  :global(.dialog-container button.ok:hover, .dialog-container input[type=submit].ok:hover, .dialog-container button.cancel:hover,  .dialog-container button.error:hover) {
    opacity: 0.7;
  }

  :global(.dialog-container button.ok, .dialog-container input[type=submit].ok) {
    background-color: #4670a6;
    color: white;
  }

  :global(.dialog-container button.cancel) {
    background-color: #ddd;
    color: #222;
  }

  :global(.dialog-container button.error) {
    background-color: #a64646;
    color: white;
  }


  .lock {
    max-width: 450px;
  }

  :global(.mage-theme-dark .dialog){
    background-color: #2a2a2a;
    border: 1px #636363 solid;
    color: #ddd;
  }


  :global(.mage-theme-dark input){
    background-color: #1d1d1d;
    border: 2px #161616 solid;
    color: #ddd;
  }

  :global(.mage-theme-dark .dialog a){
    color: rgb(116, 134, 255);
  }

  :global(.mage-theme-dark button, .mage-theme-dark input[type=submit]){
    border: 1px #666 solid !important;
  }

  :global(.mage-theme-dark button.cancel, .mage-theme-dark input[type=submit].cancel){
    color: #ddd;
    background-color: #000;
  }

  :global(button.ok[disabled]){
    background-color: #444 !important;
    cursor: not-allowed;
  }
</style>

