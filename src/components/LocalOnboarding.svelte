<script lang="ts">
import { appPath, recentFiles } from '../javascript/appMode.js'
import { _ } from "svelte-i18n";
import logo from '../assets/img/logo.png'



let updating = false
let updatingMsg = "Updating"

const newFile = async() => {
  appPath.set(await window.Neutralino.os.showSaveDialog($_('app.openlocal'), {
    defaultPath: 'book.md',
    forceOverwrite: true,
    filters: [
      {name: 'Books', extensions: ['md', 'xlgc']},
      {name: 'All files', extensions: ['*']}
    ]

  }))

}

let recentParsed = []


$: {
  if($recentFiles){
    recentParsed = Object.entries($recentFiles).sort( ([aK, a], [bK, b]) => b.timestamp - a.timestamp )
  }
}


</script>


{#if updating}

  <div class="dialog-container">
    <div class="spinner-1"></div>
    <p>{updatingMsg}</p>  
  </div>
  
{:else}
<div class="dialog-container">
  <div style="display: flex; align-items: center; margin-top: 20px">
    <img src={logo} alt="logo">
    <div style="margin-left:50px">
      <button class="ok" on:click={newFile}>{$_('app.openlocal')}</button><br>
      {#await window.Neutralino.updater.checkForUpdates('https://librogamesland.github.io/magebook/neutralino.config.json')}
        <!-- -->
      {:then manifest}
        {#if manifest.version != NL_APPVERSION}W
          <button class="error" on:click={async() => {
            updating = true
            await window.Neutralino.updater.install();
            await window.Neutralino.app.restartProcess();
          }}>Update to v {manifest.version}</button>
        {/if}
      {:catch error}
        <p style="color: red">{error.message}</p>
      {/await}

    </div>
  </div>
  <div class="card-container">
    {#each recentParsed as [path, recentBook]}
    <div class="card" on:click={()=> appPath.set(path)}>
      <div style="flex-grow: 1">
        <div style="font-weight: bold">{recentBook.title || ""}</div>
        <div>{path}</div>
      </div>
      <div>
        <div>{new Date(recentBook.timestamp).toLocaleDateString()}</div>
      </div>
    </div>
    {/each}
  </div>
  <p>Magebook editor - v {NL_APPVERSION}</p>
</div>
{/if}

<style>
  div.dialog-container {
    width: 100vw;
    height: 100vh;
    flex-direction: column;
    left: 0;
    top: 0;
    text-align: center;
    box-sizing: border-box;
  }

  .card-container {
    margin-top: 5vh; width: 80vw; max-width: 750px; 
    max-height: calc(65vh - 50px); 
    overflow-y: auto;
  }

  .card {
    background-color: #e0e0e0;
    width: 100%;
    display: flex;
    text-align: left;
    border-radius: 4px;
    padding: 12px 25px;
    box-sizing: border-box;
    margin-bottom: 2px;
    cursor: pointer;
  }

  @media (hover: hover) and (pointer: fine) {
    .card:hover { background-color: #bbb; }
  }


  img {
    max-height: calc(15vh + 50px);
  }


  .spinner-1 {
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