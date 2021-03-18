<script context="module">
  import { writable } from 'svelte/store'

  /* Dialogs params & state
  
  
  */
  const dialogStore = writable({})
  const dialog = (component, ...params) =>
    new Promise((resolve) =>
      dialogStore.set({
        component,
        callback(...args) {
          dialogStore.set({})
          resolve(...args)
        },
        params: writable(params),
      })
    )
  export { dialog, dialogStore }
</script>

<script>
  import { _ } from 'svelte-i18n'
  import { tick } from 'svelte'


  /* Dialog component */
  let component, callback, params


  dialogStore.subscribe( async(data) => {
    // Retrieve basic info
    ;({ component, callback, params } = data)


    await tick();
    
    const button = document.querySelector('button.ok')
    if(button) button.focus()
  })
</script>

{#if component}
  <div class="dialog-mask" on:click|self={() => callback(false)}/>
  <div class="dialog-container" on:click|self={() => callback(false)}>
    <svelte:component this={component} {params} {callback}/>
  </div>
{/if}


<style>


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
    margin-bottom: 80px;
  }

  @media (max-height: 450px){
    :global(.dialog-container > .dialog) {
      padding: 0.4rem 1.5rem 0.8rem 1.5rem;
      border-radius: 6px;
      box-sizing: border-box;
      min-height: 150px;
      max-width: calc(100vw - 30px);
      background-color: #fff;
      opacity: 1;
      margin-bottom: calc(10px + 4vh);
      max-height: calc(100vh - 30px);
      overflow-y: auto;
    }
  }

  :global(.dialog-container button.ok, .dialog-container button.cancel) {
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

  :global(.dialog-container button.ok:hover, .dialog-container button.cancel:hover) {
    opacity: 0.7;
  }

  :global(.dialog-container button.ok) {
    background-color: #4670a6;
    color: white;
  }

  :global(.dialog-container button.cancel) {
    background-color: #ddd;
    color: #222;
  }



</style>
