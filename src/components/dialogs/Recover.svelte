<script>
  import { _ } from 'svelte-i18n'
  import {previews} from '../../javascript/database.js'

  export let params
  export let callback

  !params;
</script>


<div class="dialog">
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
    max-height: calc(85vh - 170px);
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

</style>