<script>
import { appPath, recentFiles } from '../javascript/appMode.js'
import { _ } from "svelte-i18n";
import manifest from '../../package.json'


const newFile = async() => {
  appPath.set(await window.dialogFile($_('app.openlocal')))
}

let recentParsed = []


$: {
  let recent = []
  if($recentFiles){
    Object.entries($recentFiles).forEach( ([key, val]) => {
      const data = JSON.parse(val.Data)
      recent.push({path: decodeURIComponent(key), title: data.title, timestamp: val.Timestamp})
    })

    recentParsed = recent.sort( (a, b) => b.timestamp - a.timestamp )
  }
}


</script>



<div class="dialog-container">
  <div style="display: flex; align-items: center; margin-top: 20px">
    <img src="./static/img/logo.png" alt="logo">
    <div style="margin-left:50px">
      <button class="ok" on:click={newFile}>{$_('app.openlocal')}</button><br>
      {#await window.appGetVersion()}
        <p></p>
      {:then version}
        <button class="error">Update to v {version}</button>
      {:catch error}
        <p style="color: red">{error.message}</p>
      {/await}

    </div>
  </div>
  <div class="card-container">
    {#each recentParsed as recentBook}
    <div class="card" on:click={()=> appPath.set(recentBook.path)}>
      <div style="flex-grow: 1">
        <div style="font-weight: bold">{recentBook.title || ""}</div>
        <div>{recentBook.path}</div>
      </div>
      <div>20/09/2021</div>
    </div>
    {/each}
  </div>
  <p>Magebook editor - v {manifest.version}</p>
</div>


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
</style>