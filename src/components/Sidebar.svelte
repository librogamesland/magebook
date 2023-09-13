<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { tick } from 'svelte';
  import { goToChapter } from '../javascript/navigator.js'
  import scrollIntoView from 'smooth-scroll-into-view-if-needed';

  import { nullUntilLoaded, showSidemenu } from '../javascript/store.js'


  import ActionButtons from './SidebarButtons.svelte'
  import { flagURL } from '../javascript/urls';
    import type { BookChapter } from 'src/javascript/book-utils.js';


  $: ({book, selectedChapterIndex, selectedChapter } = $nullUntilLoaded)

  let windowW = 0
  let w = localStorage['mage-sidebar-width'] ? parseInt(localStorage['mage-sidebar-width']) : 250

  let preferredW = localStorage['mage-sidebar-preferredwidth'] ? parseInt(localStorage['mage-sidebar-preferredwidth']) : 250
  let newpreferredW = preferredW

  let startW = 0

  $: {
    localStorage['mage-sidebar-width'] = w
    localStorage['mage-sidebar-preferredwidth'] = preferredW
  }


  const resize = (e : MouseEvent | TouchEvent) => {
			const x = ("touches" in e) ? e.changedTouches[0].pageX : e.x
			newpreferredW = w = Math.min(Math.max(startW - x, 0), window.innerWidth * 0.45)
	}

  const endResize = () => {
    if(w < 100){
      w = 10
    }else{
      preferredW = newpreferredW
    }
  }

	const handleResize = (e : MouseEvent | TouchEvent) => {
    startW = (("touches" in e) ? e.changedTouches[0].pageX : e.x) + w

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





  $: { if($selectedChapterIndex != -1) {
    (async () =>{
      await tick();
      try{
        scrollIntoView(document.querySelector('aside ul.chapters a.selected'), {
          behavior: 'smooth',
          scrollMode: 'if-needed',
        });
      }catch(e){}
    })()
  }else{
    (async () =>{
      await tick();
      try{
        scrollIntoView(document.querySelector('aside ul.chapters a'), {
          behavior: 'smooth',
          scrollMode: 'if-needed',
        });
      }catch(e){}
    })()
  }}

  let selectedGroup = 'allgroupidtag'

  $: filteredChapters = book === null ? [] : Array.from($book.index.chapters.entries()).filter( ([_chapterIndex, chapter]) => {
    if(!selectedGroup || selectedGroup == 'allgroupidtag') return true
    if(selectedGroup == 'allgrouperrorsidtag'){
      const hasEntering = chapter.linkedFrom.length > 0
      const hasExiting  = chapter.links.length > 0 || chapter.flags.length > 0
      return (!hasEntering || !hasExiting)
    }
    if(selectedGroup == 'allgrouporphanlinksidtag'){
      const hasBrokenLinks = chapter.links.some(link => !$book.index.keys[link])
      return hasBrokenLinks
    }
    const group = chapter.group
    return group && group == selectedGroup
  })

  $: {
    if(book !== null)
    if(![...(Object.keys($book.index.chaptersWith.group)), 'allgroupidtag', 'allgrouperrorsidtag', 'allgrouporphanlinksidtag'].includes(selectedGroup)){
      selectedGroup = 'allgroupidtag'
    }
  }


  const chapterErrors = (chapter : BookChapter) => {
    const hasEntering = chapter.linkedFrom.length > 0
    const hasExiting  = chapter.links.length > 0 || chapter.flags.length > 0


    return (hasEntering ? '' : '<i class="icon-help"></i>') +
        ((hasEntering && hasExiting) ? '' : '<i class="icon-right"></i>') +
        (hasExiting ? '' : '<i class="icon-help"></i>')
  }

  const brokenLinks = (chapter : BookChapter) => {
    const hasBrokenLinks = chapter.links.some(link => !$book.index.keys[link])
    return (hasBrokenLinks ? '<b>[</b><i class="icon-help"></i><b>]</b>' : '');
  }



</script>

<svelte:window bind:innerWidth={windowW} />


<div
  class={`mask ${$showSidemenu ? 'foreground' : ''}`}
  on:click={() => $showSidemenu = false}
/>


<aside class={($showSidemenu ? 'foreground' : '') + ' flex flex-row'} style={`width: ${w}px`}>
  <div class="sidebar-resizer bg-[#ccc] hover:bg-zinc-500 dark:bg-[#272727]  hover:dark:bg-[#505050]
  border-l-2
  boder-[#ccc] dark:border-[#272727]
  flex-initial w-[6px] min-w-[6px] flex-shrink-0 h-full cursor-col-resize"
  on:touchstart|preventDefault|stopPropagation={handleResize} on:mousedown|preventDefault|stopPropagation={handleResize}>
  </div>
  <div class={"max-w-[400px] pb-5 mx-auto h-full flex flex-col w-full overflow-hidden " + (( w > 150 || windowW < 680) ? 'px-8' : 'px-3')} >
    {#if book && (w > 100 || windowW < 680)}
    <h1 class="!pl-0">
      <span class="select-dropdown w-full">
        <select bind:value={selectedGroup} class="w-full rounded-sm">
          <option value="allgroupidtag">{$_('sidemenu.allgroup')}</option>
          <option value="allgrouperrorsidtag">{$_('sidemenu.allgrouperrors')}</option>
          <option value="allgrouporphanlinksidtag">{$_('sidemenu.allgrouporphanlinks')}</option>
          {#each Object.keys($book.index.chaptersWith.group) as group}
            <option value={group}>{group}</option>
          {/each}
        </select>
      </span>
    </h1>
    <ActionButtons {windowW} {w}/>
    <ul class="chapters">
      {#each filteredChapters as [chapterIndex, chapter]}
      <a
        href={'' + '&c=' + encodeURIComponent(chapter.key)}
        class:selected={chapterIndex === $selectedChapterIndex}
        on:click|preventDefault={() => goToChapter(chapterIndex)}>
        {#if w > 200 || windowW < 680}

        {chapter.key}

        <b>{chapter.title || ''}</b>
        {#each chapter.flags || [] as flag}
          <img class="inline-block w-6 h-6" src={flagURL(flag, book)} alt={flag}/>
        {/each}
        <span class="errors">{@html chapterErrors(chapter)} </span>
        <span class="errors">{@html brokenLinks(chapter)} </span>
        {:else}
          <div class="text-center w-full mx-auto">{chapter.key}</div>
        {/if}
      </a>
      {/each}
    </ul>
    {#if $selectedChapterIndex != -1}
      <h1>{$_("sidemenu.linkshere")} {$selectedChapter.key}:</h1>
      <ul class="links-here">
        {#each $selectedChapter == null ? [] : $selectedChapter.linkedFrom as chapterIndex}
        <a
          href={'' + '&c=' + encodeURIComponent($book.index.keys[chapterIndex])}
          class:selected={chapterIndex === $selectedChapterIndex}
          on:click|preventDefault={() => goToChapter(chapterIndex)}>
          {#if w > 200 || windowW < 680}

          {$book.index.chapters[chapterIndex].key}
          <b>{$book.index.chapters[chapterIndex].title || ''}</b>
          {#each $book.index.chapters[chapterIndex].flags || [] as flag}
            <img class="inline-block w-6 h-6" src={flagURL(flag, book)} alt={flag}/>
          {/each}
          {:else}
            <div class="text-center w-full mx-auto">{$book.index.chapters[chapterIndex].key}</div>
          {/if}
        </a>
        {/each}
      </ul>
    {/if}
    {/if}
  </div>
</aside>

<style>
  aside {
    user-select: none;
    grid-area: sidebar;
    background-color: #ccc;
  }



  h1 {
    font-weight: 700;
    font-size: 1.2rem;
    box-sizing: border-box;
    padding-top: 1.8rem;
    padding-bottom: 0.6rem;
    padding-left: 3px;
    margin: 0;
  }

  select {
    display: inline-block;
    font-size: 1rem;
    min-height: 1.3rem;
    line-height: 1.3rem;
  }

  b {
    margin-left: 10px;
    color: #111;
  }

  .errors {
    float:right;
    background-color: #cb0000;
    color: #fff;
    border-radius: 2px;
    padding: 0 5px;
    white-space: nowrap;
  }

  .errors ~ .errors {
    margin-right: 10px;
  }

  :global(.chapters .errors i) {
    margin: 0 -1px;
  }

  :global(.chapters .errors i.icon-help) {
    margin: 0 -5px;
  }


  div.mask {
    display: none;
  }

  ul {
    overflow-y: auto;
    list-style-type: none;
    margin: 0px;
    padding: 0px;
    background-color: #fff;
    border: 1px solid #666;
  }

  .chapters {
    flex-grow: 1;
  }

  a {
    cursor: pointer;
    box-sizing: border-box;
    padding: 0.5rem 1rem;
    margin: 0;
    clear:both;
    overflow: auto;
    display: block;
  }



  a:nth-child(even) {
    background-color: rgb(245, 245, 245);
  }

  a:hover {
    background-color: #ddd;
  }

  a.selected {
    background-color: #64b3e1;
  }

  .links-here {
    height: 15vh;
    flex-shrink: 0;
  }

  @media only screen and (max-width: 680px) {
    div.mask.foreground {
      display: block;
      position: fixed;
      z-index: 9900;
      top: 0;
      width: 100vw;
      height: 100vh;
      left: 0;
      background-color: black;
      opacity: 0.5;
      padding: 0;
      margin: 0;
      border: 0;
    }

    aside {
      visibility: hidden;
      opacity: 0;
      display: flex;
      transition: opacity 0.2s,  transform 0.2s;
      position: fixed;
      z-index: 10000;
      top: 0;
      bottom: 0;
      right: 0;
      box-sizing: border-box;
      height: 100vh;
      width: calc(90vw - 80px) !important;
      max-width: 320px;
      transform: translateX(317px);
      background-color: rgb(209, 209, 209);
    }

    aside.foreground {
      opacity: 1;
      display: flex;
      transform: translateX(0);
      visibility: visible;

    }

    .sidebar-resizer {
      display: none;
    }

    h1 {
      color: #565656;
    }
  }

  @media only screen and (max-width: 360px) {
    aside{
      width: calc(90vw - 40px) !important;
    }
  }

  @media (any-pointer: coarse) {
    a {
      padding: 1.1rem 0.6rem;
    }
  }


  :global(.mage-theme-dark) aside{
    background-color: #272727 !important;
    color: #bbb !important;
  }

  :global(.mage-theme-dark) aside h1{
    background-color: #272727 !important;
    color: #bbb !important;
  }

  :global(.mage-theme-dark) .select-dropdown{
    background-color: #424242 !important;
    color: #bbb !important;
  }

  :global(.mage-theme-dark) aside ul{
    background-color: #161616 !important;
  }

  :global(.mage-theme-dark) aside ul a:nth-child(even) {
    background-color: #000 !important;
  }

  :global(.mage-theme-dark) aside ul a b{
    color: #fff !important;
  }

  :global(.mage-theme-dark) aside ul a:hover {
    background-color: #444 !important;
  }

  :global(.mage-theme-dark) aside ul a.selected{
    background-color: #2b356b !important;
  }



</style>
