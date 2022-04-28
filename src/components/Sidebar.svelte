<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { tick } from 'svelte';
  import { book, bookIndex } from '../javascript/new-book.js'
  import { currentChapterKey } from '../javascript/editor.js'
  import { goToChapter } from '../javascript/navigator.js'
  import scrollIntoView from 'smooth-scroll-into-view-if-needed';

  import { showSidemenu } from '../javascript/editor.js'


  import ActionButtons from './ActionButtons.svelte'


  $: { if($currentChapterKey != '') {
    (async () =>{
      await tick();
      try{
        scrollIntoView(document.querySelector('aside ul.chapters li.selected'), {
          behavior: 'smooth',
          scrollMode: 'if-needed',
        });
      }catch(e){}
    })()
  }else{
    (async () =>{
      await tick();
      try{
        scrollIntoView(document.querySelector('aside ul.chapters li'), {
          behavior: 'smooth',
          scrollMode: 'if-needed',
        });
      }catch(e){}
    })()    
  }}

  let selectedGroup = 'allgroupidtag'

  $: filterChapters = [...($bookIndex.chapters)].filter( ([key, chapter]) => {
    if(!selectedGroup || selectedGroup == 'allgroupidtag') return true
    if(selectedGroup == 'allgrouperrorsidtag'){
      const linksHere = $bookIndex.linksToChapter.get(key)
      const hasEntering = linksHere && linksHere.size > 0
      const hasExiting  = (chapter.links && chapter.links.size > 0) || (chapter.flags && chapter.flags.length > 0)
      return (!hasEntering || !hasExiting)
    }
    if(selectedGroup == 'allgrouporphanlinksidtag'){
      const hasBrokenLinks = chapter.links && [...chapter.links].some(link => !$bookIndex.chapters.has(link))
      return hasBrokenLinks
    }
    const group = chapter.group
    return group && group == selectedGroup
  })

  $: {
    if(![...($bookIndex.groups), 'allgroupidtag', 'allgrouperrorsidtag', 'allgrouporphanlinksidtag'].includes(selectedGroup)){
      selectedGroup = 'allgroupidtag'
    }
  }

  const setBookKey = (key) => {
    book.update(() => ({key}))
    $showSidemenu = false
  }

  const chapterErrors = (key, chapter) => {
    const linksHere = $bookIndex.linksToChapter.get(key)
    const hasEntering = linksHere && linksHere.size > 0
    const hasExiting  = (chapter.links && chapter.links.size > 0) || (chapter.flags && chapter.flags.length > 0)

    const brokenLinks = chapter.links && [...chapter.links].some(link => !$bookIndex.chapters.has(link))

    return (hasEntering ? '' : '<i class="icon-help"></i>') +
        ((hasEntering && hasExiting) ? '' : '<i class="icon-right"></i>') +
        (hasExiting ? '' : '<i class="icon-help"></i>')    
  }

  const brokenLinks = (key, chapter) => {
    const hasBrokenLinks = chapter.links && [...chapter.links].some(link => !$bookIndex.chapters.has(link))
    return (hasBrokenLinks ? '<b>[</b><i class="icon-help"></i><b>]</b>' : '');
  }

  // Regex per matchare i link in markdown
  $: linksHere = [... ($bookIndex.linksToChapter.get($currentChapterKey) || new Set())]

</script>

<div
  class={`mask ${$showSidemenu ? 'foreground' : ''}`}
  on:click={() => $showSidemenu = false}
/>


<aside class={$showSidemenu ? 'foreground' : ''}>
  <h1>
    <span class="select-dropdown">
      <select bind:value={selectedGroup}>
        <option value="allgroupidtag">{$_('sidemenu.allgroup')}</option>
        <option value="allgrouperrorsidtag">{$_('sidemenu.allgrouperrors')}</option>
        <option value="allgrouporphanlinksidtag">{$_('sidemenu.allgrouporphanlinks')}</option>
        {#each [...($bookIndex.groups)] as group}
          <option value={group}>{group}</option>
        {/each}
      </select>
    </span>
  </h1>
  <ActionButtons />
  <ul class="chapters">
    {#each filterChapters as [key, chapter]}
    <li
      class:selected={key === $currentChapterKey}
      on:click={() => goToChapter(key)}>
      {key}
      <b>{chapter.title || ''}</b>
      {#each chapter.flags || [] as flag}
        <img src={`./static/img/flags/${flag}.png`} alt={flag}/>
      {/each}
      <span class="errors">{@html chapterErrors(key, chapter)} </span>
      <span class="errors">{@html brokenLinks(key, chapter)} </span>

    </li>
    {/each}
  </ul>
  <h1>{$_("sidemenu.linkshere")} {$currentChapterKey}:</h1>
  <ul class="links-here">
    {#each linksHere as key}
    <li
      class:selected={key === $currentChapterKey}
      on:click={() => goToChapter(key)}>
      {key}
      <b>{$bookIndex.chapters.get(key).title || ''}</b>
      {#each $bookIndex.chapters.get(key).flags || [] as flag}
        <img src={`./static/img/flags/${flag}.png`} alt={flag}/>
      {/each}
    </li>
    {/each}
  </ul>
</aside>

<style>
  aside {
    user-select: none;
    grid-area: sidebar;
    background-color: #ccc;
    padding: 0px 4vw;
    padding-bottom: 50px;
    display: flex;
    flex-direction: column;
    max-height: 100%;
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

  li {
    cursor: pointer;
    box-sizing: border-box;
    padding: 0.5rem 1rem;
    margin: 0;
    clear:both;
    overflow: auto;
  }

  

  li:nth-child(even) {
    background-color: rgb(245, 245, 245);
  }

  li:hover {
    background-color: #ddd;
  }

  li.selected {
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
      opacity: 0;
      transition: opacity 0.2s,  transform 0.2s;
      position: fixed;
      z-index: 10000;
      top: 0;
      bottom: 0;
      right: 0;
      box-sizing: border-box;
      height: 100vh;
      width: calc(90vw - 80px);
      max-width: 320px;
      transform: translateX(317px);
      background-color: rgb(209, 209, 209);
    }
    aside.foreground {
      opacity: 1;
      display: flex;
      transform: translateX(0);
    }

    h1 {
      color: #565656;
    }
  }

  @media only screen and (max-width: 360px) {
    aside{
      width: calc(90vw - 40px);
    }
  }

  @media (any-pointer: coarse) {
    li {
      padding: 1.1rem 0.6rem;
    }
  }


  :global(.mage-theme-dark aside){
    background-color: #272727 !important;
    color: #bbb !important;
  }

  :global(.mage-theme-dark aside h1){
    background-color: #272727 !important;
    color: #bbb !important;
  }
 
  :global(.mage-theme-dark aside ul){
    background-color: #161616 !important;
  }

  :global(.mage-theme-dark aside ul li:nth-child(even) ){
    background-color: #000 !important;
  } 

  :global(.mage-theme-dark aside ul li b){
    color: #fff !important;
  } 

  :global(.mage-theme-dark aside ul li:hover ){
    background-color: #444 !important;
  } 

  :global(.mage-theme-dark aside ul li.selected ){
    background-color: #2b356b !important;
  } 
  


</style>
