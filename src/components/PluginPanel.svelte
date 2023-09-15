<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { store } from "../javascript/store";
  //@ts-ignore
  import { pluginPanel } from '../javascript/plugin-interface';
  import { portrait } from "../javascript/viewport";
  import { showPluginPanel } from "../javascript/store";

  if($pluginPanel.length > 0) showPluginPanel.set(true)


  const firstTab = () => {
    for(const plugin of $pluginPanel){
      if(plugin.tabs && plugin.tabs[0]) return plugin.tabs[0].id
    }

    return null
  }

  const minW = 8

  let tab = firstTab()
  let w = localStorage['mage-pluginpanel-width'] ? parseInt(localStorage['mage-pluginpanel-width']) : minW
  let h = 250
  let isResizing = false

  let preferredW = localStorage['mage-pluginpanel-preferredwidth'] ? parseInt(localStorage['mage-pluginpanel-preferredwidth']) : 500
  let newpreferredW = preferredW

  let startW = 0
  let startH = 0

  $: {
    localStorage['mage-pluginpanel-width'] = w
    localStorage['mage-pluginpanel-preferredwidth'] = preferredW
  }


  const resize = (e : MouseEvent | TouchEvent) => {
		if($portrait){
			const y = ("touches" in e) ? e.changedTouches[0].pageY : e.y
			h = Math.min(startH + y, 0)
		}else{
			const x = ("touches" in e) ? e.changedTouches[0].pageX : e.x
			newpreferredW = w = Math.min(Math.max(startW - x, minW), window.innerWidth * 0.45)
		}
	}


  const endResize = () => {
    isResizing = false
    if(w < 30){
      w = minW
    }else{
      preferredW = newpreferredW
    }
  }

	const handleResize = (e : MouseEvent | TouchEvent) => {
		if($portrait){
			startH = (("touches" in e) ? e.changedTouches[0].pageY : e.y) + h
		}else{
			startW = (("touches" in e) ? e.changedTouches[0].pageX : e.x) + w
		}
    isResizing = true

		if("touches" in e){
				document.addEventListener("touchmove", resize, false);
				document.addEventListener("touchend", () => {
            endResize()
						document.removeEventListener("touchmove", resize, false);
				}, {once: true});
		}else{
				document.addEventListener("mousemove", resize, false);
				document.addEventListener("mouseup", () => {
            endResize()
						document.removeEventListener("mousemove", resize, false);
				}, {once: true});
		}
	}

</script>

<div class={"plugin-panel bg-zinc-400 flex " + (($showPluginPanel && !(tab == null)) ? '' : 'hidden')} style="grid-area: pluginpanel">

  <div class="overflow-y-auto relative" style={`width: calc(${w}px)`}>
    <div class="bg-zinc-400 absolute l-0 hover:bg-zinc-500 border-l-0 border-zinc-500 flex-initial flex-shrink-0 w-[8px] h-full cursor-col-resize"
    on:touchstart|preventDefault|stopPropagation={handleResize} on:mousedown|preventDefault|stopPropagation={handleResize}>

    </div>
    {#each $pluginPanel as plugin}
      {#if plugin.widget}
        <svelte:component this={plugin.widget} {store} {w} {tab} {isResizing}/>
      {/if}
    {/each}
  </div>
  <div class="bg-slate-500 select-none">
    {#each $pluginPanel as plugin}
      {#each plugin.tabs as pluginTab}
        <button class={"h-[60px] w-[60px] m-2 py-1 rounded-md bg-slate-600 hover:shadow-md shadow-black cursor-pointer hover:scale-105 transition-all flex justify-center items-center "
          + (pluginTab.id == tab ? 'bg-slate-800' : '')}
        on:click={() => {
          if(tab === pluginTab.id){
            w = (w < 10) ? preferredW : minW
            return
          }
          tab = pluginTab.id
          if(w < 10) w = preferredW

        }}>
          <div class="text-center">
            {#if pluginTab.icon} {@html pluginTab.icon} {/if}

            {#if pluginTab.label}
              <span class="text-slate-300 text-xs font-bold">
                {@html $_(pluginTab.label)}
              </span>
            {/if}
          </div>


        </button>
      {/each}
    {/each}
  </div>
</div>

<style>
  .shadow-left{
    box-shadow: -6px 1px 12px 0px rgb(0 0 0 / 26%), 0 4px 6px -4px rgb(0 0 0 / 38%);
  }
</style>