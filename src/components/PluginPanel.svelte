<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { store } from "../javascript/store";
  //@ts-ignore
  import { plugins } from  'mage-plugins';
  import { portrait } from "../javascript/viewport";
  import { showPluginPanel } from "../javascript/store";

  if(plugins.length > 0) showPluginPanel.set(true)


  const firstTab = () => {
    for(const plugin of plugins){
      if(plugin.tabs && plugin.tabs[0]) return plugin.tabs[0].id
    }

    return null
  }

  let tab = firstTab()
  let w = localStorage['mage-pluginpanel-width'] ? parseInt(localStorage['mage-pluginpanel-width']) : 250
  let h = 250

  let preferredW = localStorage['mage-pluginpanel-preferredwidth'] ? parseInt(localStorage['mage-pluginpanel-preferredwidth']) : 250
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
			newpreferredW = w = Math.min(Math.max(startW - x, 0), window.innerWidth * 0.45)
		}
	}

  const endResize = () => {
    if(w < 30){
      w = 0
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

<div class={"plugin-panel bg-zinc-400 z-10 flex " + (($showPluginPanel && !(tab == null)) ? '' : 'hidden')} style="grid-area: pluginpanel">
  <div class="bg-zinc-400 hover:bg-zinc-500 border-l-0 border-zinc-500 flex-initial flex-shrink-0 w-[6px] h-full cursor-col-resize"
  on:touchstart|preventDefault|stopPropagation={handleResize} on:mousedown|preventDefault|stopPropagation={handleResize}>

  </div>
  <div class="overflow-y-auto" style={`width: calc(${w}px)`}>
    {#each plugins as plugin}
      {#if plugin.widget}
        <svelte:component this={plugin.widget} {store} {w} {tab}/>
      {/if}
    {/each}
  </div>
  <div class="bg-slate-500">
    {#each plugins as plugin}
      {#each plugin.tabs as pluginTab}
        <div class={"h-[60px] w-[60px] m-2 py-1 rounded-md bg-slate-600 hover:shadow-md shadow-black cursor-pointer hover:scale-105 transition-all flex justify-center items-center "
          + (pluginTab.id == tab ? 'bg-slate-800' : '')}
        on:click={() => {
          if(tab === pluginTab.id){
            w = (w < 10) ? preferredW : 0
            return
          }
          tab = pluginTab.id
          if(w < 10) w = preferredW

        }}>
          <div class="text-slate-300 text-xs font-bold text-center">{@html $_(pluginTab.id)}</div>
        </div>
      {/each}
    {/each}
  </div>
</div>

<style>
  .shadow-left{
    box-shadow: -6px 1px 12px 0px rgb(0 0 0 / 26%), 0 4px 6px -4px rgb(0 0 0 / 38%);
  }
</style>