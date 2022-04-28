<script lang="ts">
  import { _ } from 'svelte-i18n'
  import {previews} from '../../javascript/database.js'

  export let params
  export let callback

  !params;
</script>


<div class="dialog recover">
  <h3>{$_('navbar.file.recover')}</h3>
  {#await previews()}
    Loading...
  {:then sessions}
  <ul>
    {#each sessions as session}
    <li><a href={'#msession=' + session.id}>{session.name}
        <span>{session.time.toLocaleDateString()} {session.time.toLocaleTimeString()}</span></a></li>
    {/each}
  </ul>
  {/await}
  <h3>{$_('navbar.file.recover')}</h3>
  {#await previews()}
    Loading...
  {:then sessions}
  <ul>
    {#each sessions as session}
    <li><a href={'#msession=' + session.id}>{session.name}
        <span>{session.time.toLocaleDateString()} {session.time.toLocaleTimeString()}</span></a></li>
    {/each}
  </ul>
  {/await}
  <button class="cancel" on:click={() => callback(false)}>{$_('dialogs.cancel')}</button>
</div>

<style>
  a {
    display: inline-block;
    width: 100%;
    text-decoration: none;
  }

  h3 {
    margin-bottom: 8px;
  }

  span {
    float:right;
  }

  ul {
    overflow-y: auto;
    list-style-type: none;
    margin: 0px;
    padding: 0px;
    background-color: #fff;
    border: 1px solid #666;
    max-height: calc(40vh - 80px);
    overflow-y: auto;
    width: 100%;
    max-width: 400px;
    display: inline-block;
  }


  li {
    cursor: pointer;
    box-sizing: border-box;
    padding: 0.5rem 1rem;
    margin: 0;
  }

  li:nth-child(even) {
    background-color: rgb(245, 245, 245);
  }

  li:hover {
    background-color: #ddd;
  }

  @media (any-pointer: coarse) {
    li {
      padding: 1.1rem 0.6rem;
    }
  }


  :global(.mage-theme-dark div.dialog.recover ul){
    background-color: #000;
  }

  :global(.mage-theme-dark div.dialog.recover li:nth-child(even)) {
    background-color: rgb(30, 30, 30);
  }

  :global(.mage-theme-dark div.dialog.recover li:hover) {
    background-color: rgb(68, 68, 68);
  }

</style>