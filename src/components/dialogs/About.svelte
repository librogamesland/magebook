<script lang="ts">
  import { _ } from 'svelte-i18n'
  import manifest from '../../../package.json'
  import logo from '../../assets/img/logo.png'


  export let params : null
  export let callback : (value: any) => void

  !params;
</script>

<div class="dialog">
  <h3>Magebook - v. {manifest.version}</h3>
  <img src={logo} alt="Magebook logo">
  <br>
  <p>{@html $_('about.text')}</p>
  <p>{$_('about.contact')}: <a target="_blank" rel="noopener" href="mailto:luca.fabbian.1999@gmail.com?subject=Magebook%20-%20Segnalazione">luca.fabbian.1999@gmail.com</a></p>
  <button class="ok" on:click={() => callback(true)}>{$_('dialogs.ok')}</button>
</div>

<style>
  .dialog {
    width: 500px;
    max-width: calc(100vw - 30px);
    text-align: center;
  }

  p {
    line-height: 1.4rem;
  }

  img {
    width: 200px;
    max-width: calc(100vw - 90px);
  }

  button {
    margin-right: 0;
  }
</style>