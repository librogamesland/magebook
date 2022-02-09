<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { onDestroy } from 'svelte';
  import { tick } from 'svelte'
  export let params
  export let callback

  let loaded = false
  let waiting = false
  let src
  const unsubscribe = params.subscribe( async(values) => {
    loaded = false
    waiting = true
    await tick();
    setTimeout(async() => {
      src = await Promise.resolve(values[0]())
      loaded = true

    }, 100);
  })
  
  onDestroy(unsubscribe)

  // IN THE PAST I CHANGED SVG WIDTH TO FIT WITH:
  // {@html src.replace(/width=\"([^"]*)\"/, 'width="100%"').replace(/height=\"([^"]*)\"/, '')}
</script>

{#if loaded}
<div class="imgbox" on:click={async() => {
  src = ''
  await tick();
  callback(false)
}}>
  
  <div on:click|stopPropagation={() => console.log("clickOnImg")} style="max-width:90vw; max-height: 80vh; overflow: auto;">
  {@html src}
  </div>
  <button class="ok" on:click={ () => {
    const blob = new window.Blob([src], { type: "image/svg+xml" });
    // create an URI pointing to that blob
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    // so the Garbage Collector can collect the blob
    win.onload = () => URL.revokeObjectURL(url);

    }}>{$_('dialogs.graph.open')}</button>
</div>
{:else if waiting}
<div class="dialog" style="text-align: center">
  <p>{$_('dialogs.graph.loading')}</p>
  <div class="spinner-1"></div>

</div>
{/if}

<style>
  /* https://stackoverflow.com/questions/6169666/how-to-resize-an-image-to-fit-in-the-browser-window */
  .imgbox {
    display: grid;
    height: 100%;
    align-items: center;
  }

  :global(.spinner-1) {
    margin-top: 20px;
    display: inline-block;
    width:50px;
    height:50px;
    border-radius:50%;
    padding:1px;
    background:conic-gradient(#0000 10%,#004cff) content-box;
    -webkit-mask:
      repeating-conic-gradient(#0000 0deg,#000 1deg 20deg,#0000 21deg 36deg),
      radial-gradient(farthest-side,#0000 calc(100% - 9px),#000 calc(100% - 8px));
    -webkit-mask-composite: destination-in;
    mask-composite: intersect;
    animation:s4 1s infinite steps(10);
  }
  @keyframes s4 {to{transform: rotate(1turn)}}
</style>