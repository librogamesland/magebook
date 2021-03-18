<script>
  import { onDestroy } from 'svelte';
  export let params
  export let callback

  let loaded = false
  let waiting = false
  let src
  const unsubscribe = params.subscribe( async(values) => {
    loaded = false
    waiting = false
    setTimeout(() => {
      waiting = true
    }, 2500)
    src = await Promise.resolve(values[0])
    loaded = true
  })
  
  onDestroy(unsubscribe)
  if(callback){}
</script>

{#if loaded}
<div class="imgbox" on:click={() => callback(false)}>
  <img class="center-fit" {src} alt="book graph"/>
</div>
{:else if waiting}
<div class="dialog">
  <p>Loading graph...</p>
</div>
{/if}

<style>
  /* https://stackoverflow.com/questions/6169666/how-to-resize-an-image-to-fit-in-the-browser-window */
  .imgbox {
    display: grid;
    height: 100%;
    align-items: center;
  }
  .center-fit {
    max-width: 95%;
    max-height: 100vh;
    margin: auto;
  }
</style>