<script lang="ts">
  import { encode } from 'js-base64';
  import dateFormat from 'date-format';
  import { _ } from 'svelte-i18n'
  import { onDestroy } from 'svelte';
  import { tick } from 'svelte'
  import { store } from '../../javascript/store';
  import { isVSCode, vscode } from '../../javascript/vscode';
  import {s} from '../../javascript/settings'

  import {get} from 'svelte/store'

  export let params
  export let callback


  let book = null
  store.then( r => ({book} = r))

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
  
  <div on:click|stopPropagation={() => {}} style="max-width:90vw; max-height: 80vh; overflow: auto;">
  {@html src}
  </div>
  <div>
    {#if isVSCode }
    <button class="error" on:click={ () => {
        const suffix = `-${dateFormat.asString(get(s.dateFormat), new Date())}.svg`

          vscode.postMessage({
            type: 'saveFile',
            suffix,
            blob: `data:image/svg+xml;base64,${encode(src)}`,
          });
      
      }}>{$_('dialogs.graph.download')}</button>
    {:else}
    <button class="ok" on:click={ () => {
      const blob = new window.Blob([src], { type: "image/svg+xml" });
      // create an URI pointing to that blob
      const url = URL.createObjectURL(blob);
      const win = window.open(url);
      // so the Garbage Collector can collect the blob
      win.onload = () => URL.revokeObjectURL(url);

      }}>{$_('dialogs.graph.open')}</button>
      <button class="error" on:click={ () => {
          const element = document.createElement('a')
          element.setAttribute(
            'href',
            `data:image/svg+xml;base64,${encode(src)}`
          )

          element.setAttribute('download', (book.index.properties.title || 'graph') + '.svg')
          element.style.display = 'none'
          document.body.appendChild(element)
          element.click()
          document.body.removeChild(element)
      
      }}>{$_('dialogs.graph.download')}</button>
    {/if}
  </div> 
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